import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      appointmentDetails 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !appointmentDetails) {
      return NextResponse.json({ error: 'Missing payment or appointment parameters' }, { status: 400 });
    }

    const { date, timeSlot, caseType, notes = '', feePaid } = appointmentDetails;

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isSignatureValid = false;

    if (!keySecret || razorpay_order_id.startsWith('order_mock_')) {
      // Mock order, bypass verification for testing
      isSignatureValid = true;
    } else {
      // Real verification
      const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(bodyString)
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    const clientId = session.user.id;

    // 1. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        date: new Date(date),
        timeSlot,
        caseType,
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
        feePaid: parseFloat(feePaid),
        notes,
      },
    });

    // 2. Log Inflow Transaction to the Financial Ledger
    const transaction = await prisma.transaction.create({
      data: {
        type: 'INFLOW',
        amount: parseFloat(feePaid),
        category: 'Consultation',
        referenceId: appointment.id,
        description: `Consultation fee for ${caseType} case type booked by ${session.user.name}`,
      },
    });

    // 3. Trigger SMS and Email notifications (represented as a background promise/call)
    try {
      // Trigger nodemailer/twilio notifications asynchronously
      // In development, this will log to console if keys are missing
      await fetch(`${new URL(req.url).origin}/api/reminders/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: session.user.phone || '+919876543210',
          email: session.user.email || '',
          clientName: session.user.name || 'Client',
          date: new Date(date).toLocaleDateString(),
          timeSlot,
          type: 'booking_confirmation',
        }),
      });
    } catch (reminderErr) {
      console.warn('Reminder service could not be contacted directly:', reminderErr);
    }

    return NextResponse.json({ success: true, appointment, transaction });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

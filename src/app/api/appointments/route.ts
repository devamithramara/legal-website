import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Get Appointments (role-filtered)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let appointments: any[] = [];

    if (role === Role.ADMIN) {
      // Admin sees all appointments
      appointments = await prisma.appointment.findMany({
        include: {
          client: {
            select: { name: true, email: true, phone: true },
          },
        },
        orderBy: { date: 'asc' },
      });
    } else if (role === Role.CLIENT) {
      // Client sees only their own
      appointments = await prisma.appointment.findMany({
        where: { clientId: id },
        orderBy: { date: 'asc' },
      });
    } else {
      // Junior doesn't manage appointments directly
      appointments = [];
    }

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create Appointment (Admin cash booking / direct scheduling)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, date, timeSlot, caseType, notes, feePaid, status = 'CONFIRMED', paymentId } = body;

    if (!clientId || !date || !timeSlot || !caseType || feePaid === undefined || feePaid === null) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        date: new Date(date),
        timeSlot,
        caseType,
        notes,
        feePaid: parseFloat(feePaid),
        status,
        paymentId: paymentId || 'DIRECT',
      },
    });

    // Write to ledger only if fee > 0
    if (parseFloat(feePaid) > 0) {
      await prisma.transaction.create({
        data: {
          type: 'INFLOW',
          amount: parseFloat(feePaid),
          category: 'Consultation',
          referenceId: appointment.id,
          description: `Consultation fee for client ID: ${clientId} (${caseType})`,
        },
      });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

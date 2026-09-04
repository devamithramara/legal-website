import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, ReminderStatus } from '@prisma/client';
import twilio from 'twilio';

async function sendTwilioSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Error in Cause List]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Cause List] To: ${to} | Message: "${body}"`);
  return false;
}

// Helper to execute Prisma queries with automatic cold-start retry
async function withPrismaRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err?.code === 'P1001' || err?.message?.includes('Can\'t reach database server'))) {
      console.warn(`[Prisma DB Retry] Retrying connection... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, 1000));
      return withPrismaRetry(fn, retries - 1);
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.JUNIOR)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { caseId, nextHearing, court, notes, sendSms = true } = await req.json();

    if (!caseId || !nextHearing) {
      return NextResponse.json({ error: 'Missing caseId or nextHearing date.' }, { status: 400 });
    }

    const hearingDateObj = new Date(nextHearing);

    // 1. Fetch case with client details
    const existingCase = await withPrismaRetry(() =>
      prisma.case.findUnique({
        where: { id: caseId },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          junior: { select: { id: true, name: true, phone: true } },
        },
      })
    );

    if (!existingCase) {
      return NextResponse.json({ error: 'Case folder not found.' }, { status: 404 });
    }

    const updatedCourt = court || existingCase.court || 'High Court Bench';

    // 2. Update Case record in DB
    const updatedCase = await withPrismaRetry(() =>
      prisma.case.update({
        where: { id: caseId },
        data: {
          nextHearing: hearingDateObj,
          court: updatedCourt,
        },
      })
    );

    // 3. Create CaseEvent timeline entry
    const eventTitle = notes ? `Hearing Scheduled: ${notes}` : `Hearing Scheduled at ${updatedCourt}`;
    const caseEvent = await withPrismaRetry(() =>
      prisma.caseEvent.create({
        data: {
          caseId,
          eventDate: hearingDateObj,
          title: eventTitle,
          notes: notes || `Hearing listed for ${hearingDateObj.toLocaleDateString('en-IN')}`,
        },
      })
    );

    // 4. Create & Trigger Twilio SMS Reminder
    const dateFormatted = hearingDateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const smsMessage = `Your case ${existingCase.caseNumber} is listed for hearing at ${updatedCourt} on ${dateFormatted}. Stage: ${notes || 'Regular Hearing'}. - MLR ASSOCIATES`;

    let smsSent = false;
    if (sendSms && existingCase.client.phone) {
      smsSent = await sendTwilioSms(existingCase.client.phone, smsMessage);
    }

    // Schedule 24h prior reminder entry in DB
    const scheduledFor = new Date(hearingDateObj.getTime() - 24 * 60 * 60 * 1000);
    await withPrismaRetry(() =>
      prisma.hearingReminder.create({
        data: {
          caseId,
          recipientId: existingCase.client.id,
          recipientType: 'CLIENT',
          channel: 'SMS',
          message: smsMessage,
          status: smsSent ? ReminderStatus.SENT : ReminderStatus.PENDING,
          sentAt: smsSent ? new Date() : null,
          scheduledFor,
        },
      })
    );

    return NextResponse.json({
      success: true,
      case: updatedCase,
      caseEvent,
      smsSent,
      message: `Cause list updated for case ${existingCase.caseNumber}. Timeline & FullCalendar synchronized.`,
    });
  } catch (error: any) {
    console.error('[Cause List Update Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

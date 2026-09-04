import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReminderStatus } from '@prisma/client';
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
      console.error('[Twilio Error in Daily Reminder]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Daily Cause List Digest] To: ${to} | Message: "${body}"`);
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

// GET or POST /api/cause-list/daily-reminder
export async function GET(req: Request) {
  return handleDailyReminder();
}

export async function POST(req: Request) {
  return handleDailyReminder();
}

async function handleDailyReminder() {
  try {
    const now = new Date();
    // Non-mutating Date bounds for today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Fetch today's listed cases with retry
    const todaysHearings = await withPrismaRetry(() =>
      prisma.case.findMany({
        where: {
          status: { not: 'CLOSED' },
          nextHearing: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          client: { select: { name: true, phone: true } },
          junior: { select: { name: true, phone: true } },
        },
      })
    );

    // 2. Fetch advocates (Admins & Juniors) to notify
    const advocates = await withPrismaRetry(() =>
      prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'JUNIOR'] },
        },
        select: { id: true, name: true, email: true, phone: true, role: true },
      })
    );

    // 3. Construct Daily Digest Message
    const count = todaysHearings.length;
    const courtList = Array.from(new Set(todaysHearings.map(c => c.court || 'High Court'))).join(', ') || 'Chambers Court Benches';

    const digestMessage = count > 0
      ? `7:30 AM Cause List Alert: You have ${count} active case(s) listed for hearing today at ${courtList}. Update hearing outcomes at: /admin/cause-list - MLR ASSOCIATES`
      : `7:30 AM Cause List Alert: No scheduled hearings today at ${courtList}. Update cause list at: /admin/cause-list - MLR ASSOCIATES`;

    // 4. Send SMS to Advocates if phone available
    const sentAdvocates: string[] = [];
    for (const advocate of advocates) {
      if (advocate.phone) {
        const sent = await sendTwilioSms(advocate.phone, digestMessage);
        if (sent) sentAdvocates.push(advocate.name);
      }
    }

    // 5. Send pending client SMS reminders
    const pendingReminders = await withPrismaRetry(() =>
      prisma.hearingReminder.findMany({
        where: {
          status: ReminderStatus.PENDING,
          scheduledFor: {
            not: null,
            lte: new Date(),
          },
        },
        include: {
          recipient: { select: { phone: true } },
        },
      })
    );

    let sentClientsCount = 0;
    for (const reminder of pendingReminders) {
      if (reminder.recipient.phone) {
        const sent = await sendTwilioSms(reminder.recipient.phone, reminder.message);
        if (sent) {
          sentClientsCount++;
          await withPrismaRetry(() =>
            prisma.hearingReminder.update({
              where: { id: reminder.id },
              data: { status: ReminderStatus.SENT, sentAt: new Date() },
            })
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      todaysHearingsCount: count,
      todaysHearings: todaysHearings.map(c => ({ caseNumber: c.caseNumber, court: c.court, client: c.client.name })),
      digestMessage,
      advocatesNotified: sentAdvocates.length,
      clientSmsDispatched: sentClientsCount,
    });
  } catch (error: any) {
    console.error('[Daily Cause List Reminder Error]', error);
    return NextResponse.json({
      error: error.message || 'Database connection error during digest trigger.',
      details: 'Neon PostgreSQL connection retry attempted.'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Checklist Reminder Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 6:00 PM Checklist Reminder] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleChecklistReminder();
}

export async function POST() {
  return handleChecklistReminder();
}

async function handleChecklistReminder() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

    const upcomingChecklists = await prisma.hearingChecklist.findMany({
      where: {
        completionPct: { lt: 100 },
        case: {
          nextHearing: { gte: startOfTomorrow, lte: endOfTomorrow },
        },
      },
      include: {
        senior: { select: { name: true, phone: true } },
        case: { select: { caseNumber: true } },
      },
    });

    const results = [];
    for (const chk of upcomingChecklists) {
      if (chk.senior && chk.senior.phone) {
        const msg = `Reminder: Tomorrow's hearing checklist for Case ${chk.case?.caseNumber} is ${chk.completionPct}% complete. Update here: /senior/checklist - MLR ASSOCIATES`;
        const sent = await sendTwilioMessage(chk.senior.phone, msg);
        results.push({ senior: chk.senior.name, caseNumber: chk.case?.caseNumber, completionPct: chk.completionPct, sent });
      }
    }

    return NextResponse.json({ success: true, count: upcomingChecklists.length, results });
  } catch (error: any) {
    console.error('[Checklist Reminder Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

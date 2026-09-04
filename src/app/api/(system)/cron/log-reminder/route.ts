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
      console.error('[Twilio Log Reminder Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 7:00 PM Log Reminder] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleLogReminder();
}

export async function POST() {
  return handleLogReminder();
}

async function handleLogReminder() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all Junior Advocates & Interns
    const juniors = await prisma.user.findMany({
      where: { role: { in: ['JUNIOR', 'INTERN'] } },
      select: { id: true, name: true, phone: true },
    });

    const results = [];

    for (const junior of juniors) {
      // Check if daily log already submitted today
      const existingLog = await prisma.dailyLog.findFirst({
        where: {
          juniorId: junior.id,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!existingLog) {
        const smsText = `Reminder: Hi ${junior.name}, please submit your daily work log before 9 PM today at /junior/log. - MLR ASSOCIATES`;
        let sent = false;
        if (junior.phone) {
          sent = await sendTwilioMessage(junior.phone, smsText);
        }
        results.push({ junior: junior.name, status: 'REMINDED', sent });
      } else {
        results.push({ junior: junior.name, status: 'ALREADY_SUBMITTED', sent: false });
      }
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Log Reminder Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

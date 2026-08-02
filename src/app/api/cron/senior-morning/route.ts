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
      console.error('[Twilio Senior Morning Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 8:00 AM Senior Morning Digest] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleSeniorMorning();
}

export async function POST() {
  return handleSeniorMorning();
}

async function handleSeniorMorning() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const seniors = await prisma.user.findMany({
      where: { role: 'SENIOR' },
      select: { id: true, name: true, phone: true },
    });

    const results = [];

    for (const senior of seniors) {
      const ownHearings = await prisma.case.findMany({
        where: {
          seniorId: senior.id,
          nextHearing: { gte: startOfDay, lte: endOfDay },
        },
        select: { caseNumber: true, court: true },
      });

      const pendingDraftsCount = await prisma.draft.count({ where: { status: 'UNDER_REVIEW' } });
      const openEscalationsCount = await prisma.escalation.count({ where: { status: 'OPEN' } });

      const digestText = `Good morning Advocate ${senior.name}. Today: ${ownHearings.length} hearing(s), ${pendingDraftsCount} junior review item(s), ${openEscalationsCount} open escalation(s). Open Senior Workspace: /senior/dashboard - MLR ASSOCIATES`;

      let sent = false;
      if (senior.phone) {
        sent = await sendTwilioMessage(senior.phone, digestText);
      }

      results.push({ senior: senior.name, hearings: ownHearings.length, pendingDraftsCount, openEscalationsCount, sent });
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Senior Morning Digest Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

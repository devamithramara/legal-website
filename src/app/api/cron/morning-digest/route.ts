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
      console.error('[Twilio Morning Digest Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 8:00 AM Morning Digest] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleMorningDigest();
}

export async function POST() {
  return handleMorningDigest();
}

async function handleMorningDigest() {
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
      // Today's hearings assigned to junior
      const todaysHearings = await prisma.case.findMany({
        where: {
          assignedTo: junior.id,
          nextHearing: { gte: startOfDay, lte: endOfDay },
        },
        select: { caseNumber: true, court: true },
      });

      // Today's tasks assigned to junior
      const todaysTasks = await prisma.task.findMany({
        where: {
          assignedTo: junior.id,
          status: { not: 'DONE' },
          deadline: { gte: startOfDay, lte: endOfDay },
        },
        select: { title: true, priority: true },
      });

      const hearingSummary = todaysHearings.length > 0
        ? todaysHearings.map(h => `${h.court}: Case ${h.caseNumber}`).join(', ')
        : 'None';

      const digestText = `Good morning ${junior.name}. You have ${todaysHearings.length} hearing(s) today [${hearingSummary}]. Tasks due today: ${todaysTasks.length}. Open workspace: /junior/dashboard - MLR ASSOCIATES`;

      let sent = false;
      if (junior.phone) {
        sent = await sendTwilioMessage(junior.phone, digestText);
      }

      results.push({ junior: junior.name, hearings: todaysHearings.length, tasks: todaysTasks.length, sent });
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Morning Digest Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

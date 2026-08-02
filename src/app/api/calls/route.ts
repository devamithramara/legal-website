import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioAlert(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Call Alert Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Escalation Alert] To: ${to} | Body: "${body}"`);
  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, clientId, duration, summary, actionItems = [], escalate = false } = await req.json();

    if (!caseId || !clientId || !duration || !summary) {
      return NextResponse.json({ error: 'Missing required call log fields.' }, { status: 400 });
    }

    const callLog = await prisma.clientCallLog.create({
      data: {
        caseId,
        juniorId: session.user.id,
        clientId,
        date: new Date(),
        duration: parseInt(duration, 10),
        summary,
        actionItems: Array.isArray(actionItems) ? actionItems : [actionItems],
        escalate,
      },
    });

    let escalationCreated = null;
    if (escalate) {
      escalationCreated = await prisma.escalation.create({
        data: {
          caseId,
          raisedBy: session.user.id,
          reason: 'UNREACHABLE_CLIENT',
          description: `Call Log Escalation: ${summary}`,
          status: 'OPEN',
        },
      });

      // Fetch admin phone to alert via SMS
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { phone: true, name: true },
      });

      if (admin && admin.phone) {
        await sendTwilioAlert(
          admin.phone,
          `Escalation Raised: Junior ${session.user.name} logged an urgent client call issue for Case ID: ${caseId}. - MLR ASSOCIATES`
        );
      }
    }

    return NextResponse.json({ success: true, callLog, escalation: escalationCreated });
  } catch (error: any) {
    console.error('[Call Log Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

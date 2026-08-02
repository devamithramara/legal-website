import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioClientSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Client SMS Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Post-Hearing Client Update] To: ${to} | Body: "${body}"`);
  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, hearingDate, argued, judgeObservations, orderPassed, orderFileUrl, nextSteps = [], notifyClient = false } = await req.json();

    if (!caseId || !argued) {
      return NextResponse.json({ error: 'Missing caseId or argued content.' }, { status: 400 });
    }

    const note = await prisma.postHearingNote.create({
      data: {
        caseId,
        seniorId: session.user.id,
        hearingDate: hearingDate ? new Date(hearingDate) : new Date(),
        argued,
        judgeObservations,
        orderPassed,
        orderFileUrl,
        nextSteps: Array.isArray(nextSteps) ? nextSteps : [nextSteps],
        notifyClient: Boolean(notifyClient),
      },
    });

    // Auto-create CaseEvent timeline item
    const targetCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { client: { select: { name: true, phone: true } } },
    });

    if (targetCase) {
      await prisma.caseEvent.create({
        data: {
          caseId,
          eventDate: new Date(),
          title: `Post-Hearing Note: ${orderPassed || 'Arguments Concluded'}`,
          notes: `Senior Advocate ${session.user.name}: ${argued}`,
        },
      });

      if (notifyClient && targetCase.client && targetCase.client.phone) {
        const smsText = `Update on your case ${targetCase.caseNumber}: ${orderPassed || 'Hearing arguments completed.'} Next steps logged. - MLR ASSOCIATES`;
        await sendTwilioClientSMS(targetCase.client.phone, smsText);
      }
    }

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error('[Post-Hearing POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

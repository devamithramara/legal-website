import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, ReminderStatus } from '@prisma/client';
import twilio from 'twilio';

const ADVOCATE_NAME = 'M L Ramesh, MLR Associates';

function buildSmsMessage(
  templateType: 'day_before' | 'morning_of',
  caseNumber: string,
  title: string,
  court: string,
  date: string,
  customMessage?: string | null
): string {
  if (customMessage) {
    return customMessage
      .replace('{caseNumber}', caseNumber)
      .replace('{title}', title)
      .replace('{court}', court)
      .replace('{date}', date)
      .replace('{advocateName}', ADVOCATE_NAME);
  }

  if (templateType === 'day_before') {
    return `Reminder: Your case ${caseNumber} - ${title} has a hearing tomorrow (${date}) at ${court}. Please be prepared. - ${ADVOCATE_NAME}`;
  }
  return `Today's Hearing: Case ${caseNumber} - ${title} at ${court}. Hearing scheduled for today ${date}. - ${ADVOCATE_NAME}`;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body, from: twilioPhone, to });
    return true;
  }

  // Mock log when Twilio is not configured
  console.log(`[Twilio MOCK] To: ${to} | Message: "${body}"`);
  return false;
}

// ─── POST /api/reminders/send ────────────────────────────────────────────────
// Handles both:
//  a) New case-based hearing reminder  → { caseId, templateType }
//  b) Legacy booking confirmation       → { phone, email, clientName, date, timeSlot, type }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();

    // ── Legacy booking-confirmation path (backward-compatible) ──
    if (!body.caseId) {
      const { phone, email, clientName, date, timeSlot, type = 'booking_confirmation' } = body;
      if (!phone && !email) {
        return NextResponse.json({ error: 'Missing contact info (phone or email)' }, { status: 400 });
      }

      const smsText =
        type === 'booking_confirmation'
          ? `Dear ${clientName}, your consultation at MLR Associates is CONFIRMED for ${date} at ${timeSlot}. Thank you.`
          : `Reminder: Dear ${clientName}, your MLR Associates hearing/consultation is scheduled in 24 hours (${date} at ${timeSlot}).`;

      let twilioSent = false;
      if (phone) {
        try {
          twilioSent = await sendSms(phone, smsText);
        } catch (err) {
          console.error('[Twilio Error]', err);
        }
      }

      return NextResponse.json({ success: true, twilioSent, simulated: !twilioSent });
    }

    // ── New case-based hearing reminder path ──
    const { caseId, templateType = 'day_before' } = body as {
      caseId: string;
      templateType?: 'day_before' | 'morning_of';
    };

    // Get settings for custom message template
    const settings = await prisma.reminderSetting.findFirst();

    // Fetch case with client + junior phone numbers
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        junior: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
    }

    const hearingDate = caseRecord.nextHearing
      ? new Date(caseRecord.nextHearing).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'TBD';

    const message = buildSmsMessage(
      templateType,
      caseRecord.caseNumber,
      caseRecord.title,
      caseRecord.court,
      hearingDate,
      settings?.customMessage
    );

    const results: { recipient: string; status: string; phone: string | null }[] = [];

    // ── Send to Client ──
    if (caseRecord.client.phone) {
      let sent = false;
      try {
        sent = await sendSms(caseRecord.client.phone, message);
      } catch (err) {
        console.error('[Twilio Client Error]', err);
      }

      await prisma.hearingReminder.create({
        data: {
          caseId,
          recipientId: caseRecord.client.id,
          recipientType: 'CLIENT',
          message,
          status: sent ? ReminderStatus.SENT : ReminderStatus.FAILED,
          sentAt: sent ? new Date() : null,
          scheduledFor: caseRecord.nextHearing,
        },
      });

      results.push({ recipient: caseRecord.client.name, status: sent ? 'SENT' : 'FAILED', phone: caseRecord.client.phone });
    } else {
      results.push({ recipient: caseRecord.client.name, status: 'SKIPPED_NO_PHONE', phone: null });
    }

    // ── Send to Junior (if assigned) ──
    if (caseRecord.junior) {
      if (caseRecord.junior.phone) {
        let sent = false;
        try {
          sent = await sendSms(caseRecord.junior.phone, message);
        } catch (err) {
          console.error('[Twilio Junior Error]', err);
        }

        await prisma.hearingReminder.create({
          data: {
            caseId,
            recipientId: caseRecord.junior.id,
            recipientType: 'JUNIOR',
            message,
            status: sent ? ReminderStatus.SENT : ReminderStatus.FAILED,
            sentAt: sent ? new Date() : null,
            scheduledFor: caseRecord.nextHearing,
          },
        });

        results.push({ recipient: caseRecord.junior.name, status: sent ? 'SENT' : 'FAILED', phone: caseRecord.junior.phone });
      } else {
        results.push({ recipient: caseRecord.junior.name, status: 'SKIPPED_NO_PHONE', phone: null });
      }
    }

    return NextResponse.json({ success: true, caseId, results });
  } catch (error: any) {
    console.error('[Reminder Send Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

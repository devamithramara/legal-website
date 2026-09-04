import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReminderStatus } from '@prisma/client';
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

  console.log(`[Twilio MOCK] To: ${to} | Message: "${body}"`);
  return false;
}

// ─── POST /api/reminders/send-upcoming ───────────────────────────────────────
// Cron-ready endpoint. Protected by Authorization: Bearer <CRON_SECRET>
// Finds all non-closed cases with nextHearing within the next 24 hours.
// Skips cases that already have a SENT reminder today.
// Sends SMS to both client and junior (if phone available).
export async function POST(req: Request) {
  try {
    // Auth check: cron secret header OR admin session
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // If no CRON_SECRET configured, allow through (development mode)

    const settings = await prisma.reminderSetting.findFirst();

    // Define 24-hour window from now
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all cases with hearings in the next 24 hours (non-closed)
    const upcomingCases = await prisma.case.findMany({
      where: {
        nextHearing: { gte: now, lte: in24Hours },
        status: { not: 'CLOSED' },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        junior: { select: { id: true, name: true, phone: true } },
        hearingReminders: {
          where: {
            status: ReminderStatus.SENT,
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
          select: { recipientId: true },
        },
      },
    });

    console.log(`[Cron] Found ${upcomingCases.length} upcoming cases within 24 hours.`);

    const summary: { caseId: string; caseNumber: string; sent: number; skipped: number; failed: number }[] = [];

    for (const caseRecord of upcomingCases) {
      const alreadySentTo = new Set(caseRecord.hearingReminders.map((r) => r.recipientId));

      const hearingDate = caseRecord.nextHearing
        ? new Date(caseRecord.nextHearing).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'TBD';

      // Determine template: morning_of if hearing is today, else day_before
      const hearingDay = caseRecord.nextHearing ? new Date(caseRecord.nextHearing).toDateString() : null;
      const templateType: 'day_before' | 'morning_of' =
        hearingDay === now.toDateString() ? 'morning_of' : 'day_before';

      const message = buildSmsMessage(
        templateType,
        caseRecord.caseNumber,
        caseRecord.title,
        caseRecord.court,
        hearingDate,
        settings?.customMessage
      );

      let sent = 0;
      let skipped = 0;
      let failed = 0;

      // ── Client ──
      if (alreadySentTo.has(caseRecord.client.id)) {
        skipped++;
      } else if (!caseRecord.client.phone) {
        console.log(`[Cron] Skipping client ${caseRecord.client.name} — no phone number.`);
        skipped++;
      } else {
        let success = false;
        try {
          success = await sendSms(caseRecord.client.phone, message);
        } catch (err) {
          console.error(`[Cron] Failed to SMS client ${caseRecord.client.name}:`, err);
        }

        await prisma.hearingReminder.create({
          data: {
            caseId: caseRecord.id,
            recipientId: caseRecord.client.id,
            recipientType: 'CLIENT',
            message,
            status: success ? ReminderStatus.SENT : ReminderStatus.FAILED,
            sentAt: success ? new Date() : null,
            scheduledFor: caseRecord.nextHearing,
          },
        });

        success ? sent++ : failed++;
      }

      // ── Junior (if assigned) ──
      if (caseRecord.junior) {
        if (alreadySentTo.has(caseRecord.junior.id)) {
          skipped++;
        } else if (!caseRecord.junior.phone) {
          console.log(`[Cron] Skipping junior ${caseRecord.junior.name} — no phone number.`);
          skipped++;
        } else {
          let success = false;
          try {
            success = await sendSms(caseRecord.junior.phone, message);
          } catch (err) {
            console.error(`[Cron] Failed to SMS junior ${caseRecord.junior.name}:`, err);
          }

          await prisma.hearingReminder.create({
            data: {
              caseId: caseRecord.id,
              recipientId: caseRecord.junior.id,
              recipientType: 'JUNIOR',
              message,
              status: success ? ReminderStatus.SENT : ReminderStatus.FAILED,
              sentAt: success ? new Date() : null,
              scheduledFor: caseRecord.nextHearing,
            },
          });

          success ? sent++ : failed++;
        }
      }

      summary.push({ caseId: caseRecord.id, caseNumber: caseRecord.caseNumber, sent, skipped, failed });
    }

    return NextResponse.json({
      success: true,
      processedCases: upcomingCases.length,
      summary,
    });
  } catch (error: any) {
    console.error('[send-upcoming Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

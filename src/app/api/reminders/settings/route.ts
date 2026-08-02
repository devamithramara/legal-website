import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// ─── GET /api/reminders/settings ─────────────────────────────────────────────
// Returns current ReminderSetting (singleton). Creates defaults if none exists.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    let settings = await prisma.reminderSetting.findFirst();

    if (!settings) {
      // Bootstrap defaults on first access
      settings = await prisma.reminderSetting.create({
        data: { daysBeforeHearing: 1, morningOfHearing: true },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[Reminder Settings GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ─── PUT /api/reminders/settings ─────────────────────────────────────────────
// Updates the singleton ReminderSetting row (upsert).
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { daysBeforeHearing, morningOfHearing, customMessage } = body;

    const existing = await prisma.reminderSetting.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.reminderSetting.update({
        where: { id: existing.id },
        data: {
          ...(daysBeforeHearing !== undefined && { daysBeforeHearing: Number(daysBeforeHearing) }),
          ...(morningOfHearing !== undefined && { morningOfHearing: Boolean(morningOfHearing) }),
          ...(customMessage !== undefined && { customMessage: customMessage || null }),
        },
      });
    } else {
      settings = await prisma.reminderSetting.create({
        data: {
          daysBeforeHearing: Number(daysBeforeHearing ?? 1),
          morningOfHearing: Boolean(morningOfHearing ?? true),
          customMessage: customMessage || null,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[Reminder Settings PUT Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

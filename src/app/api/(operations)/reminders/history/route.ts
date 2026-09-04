import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// ─── GET /api/reminders/history ──────────────────────────────────────────────
// Returns all HearingReminder records, joined with case and recipient details.
// Admin only.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const reminders = await prisma.hearingReminder.findMany({
      include: {
        case: {
          select: { caseNumber: true, title: true, court: true, nextHearing: true },
        },
        recipient: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error('[Reminders History Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

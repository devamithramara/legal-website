import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, court, hallNumber, outcome, nextDate, notes } = await req.json();

    if (!caseId || !court || !outcome) {
      return NextResponse.json({ error: 'Missing required parameters (caseId, court, outcome).' }, { status: 400 });
    }

    const appearance = await prisma.appearance.create({
      data: {
        caseId,
        juniorId: session.user.id,
        date: new Date(),
        court,
        hallNumber,
        outcome,
        nextDate: nextDate ? new Date(nextDate) : null,
        notes,
      },
    });

    // Auto-update Case.nextHearing if nextDate is provided
    if (nextDate) {
      const nextHearingObj = new Date(nextDate);
      await prisma.case.update({
        where: { id: caseId },
        data: {
          nextHearing: nextHearingObj,
          court,
        },
      });

      // Insert timeline CaseEvent
      await prisma.caseEvent.create({
        data: {
          caseId,
          eventDate: nextHearingObj,
          title: `Hearing Outcome: ${outcome}`,
          notes: notes || `Court appearance recorded by ${session.user.name}. Next date: ${nextHearingObj.toLocaleDateString('en-IN')}`,
        },
      });
    }

    return NextResponse.json({ success: true, appearance });
  } catch (error: any) {
    console.error('[Appearance Log Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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

    const { caseId, outcome = 'WON', court, lawArea = 'CRIMINAL', duration = 30, notes } = await req.json();

    if (!caseId || !court) {
      return NextResponse.json({ error: 'Missing caseId or court' }, { status: 400 });
    }

    const caseOutcome = await prisma.caseOutcome.upsert({
      where: { caseId },
      update: {
        outcome,
        court,
        lawArea,
        duration: parseInt(duration, 10),
        notes,
      },
      create: {
        caseId,
        seniorId: session.user.id,
        outcome,
        court,
        lawArea,
        duration: parseInt(duration, 10),
        notes,
      },
    });

    // Update case status to CLOSED
    await prisma.case.update({
      where: { id: caseId },
      data: { status: 'CLOSED' },
    });

    return NextResponse.json({ success: true, caseOutcome });
  } catch (error: any) {
    console.error('[Case Outcome Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

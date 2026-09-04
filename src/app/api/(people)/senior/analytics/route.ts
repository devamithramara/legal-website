import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.SENIOR && session.user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const seniorId = session.user.id;

    const [outcomes, activeCasesCount, draftsCount, appearancesCount] = await Promise.all([
      prisma.caseOutcome.findMany({
        where: { seniorId },
        include: { case: { select: { caseNumber: true, title: true } } },
      }),
      prisma.case.count({ where: { seniorId, status: 'ACTIVE' } }),
      prisma.seniorDraft.count({ where: { seniorId } }),
      prisma.appearance.count({ where: { case: { seniorId } } }),
    ]);

    const totalOutcomes = outcomes.length;
    const winsCount = outcomes.filter(o => o.outcome === 'WON').length;
    const winRate = totalOutcomes > 0 ? Math.round((winsCount / totalOutcomes) * 100) : 0;
    const avgDuration = totalOutcomes > 0
      ? Math.round(outcomes.reduce((acc, o) => acc + o.duration, 0) / totalOutcomes)
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        activeCasesCount,
        casesArguedCount: appearancesCount,
        totalOutcomes,
        winsCount,
        winRate,
        avgDuration,
        draftsCount,
        outcomes,
      },
    });
  } catch (error: any) {
    console.error('[Senior Analytics Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

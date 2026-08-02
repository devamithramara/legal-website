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

    const [drafts, researchLogs, learningItems, timeLogs] = await Promise.all([
      prisma.draft.findMany({
        where: { status: 'UNDER_REVIEW' },
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.researchLog.findMany({
        where: { approved: false },
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningItem.findMany({
        where: { status: 'READ' },
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.timeLog.findMany({
        where: { approved: false },
        include: {
          junior: { select: { name: true, email: true } },
          task: { select: { title: true, case: { select: { caseNumber: true } } } },
        },
        orderBy: { startTime: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      queue: {
        drafts,
        researchLogs,
        learningItems,
        timeLogs,
      },
    });
  } catch (error: any) {
    console.error('[Review Queue GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

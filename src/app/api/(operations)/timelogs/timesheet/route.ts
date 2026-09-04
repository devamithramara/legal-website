import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const juniorIdParam = searchParams.get('juniorId');
    const targetJuniorId = (session.user.role === Role.ADMIN && juniorIdParam) ? juniorIdParam : session.user.id;

    // Fetch time logs for past 30 days (weekly timesheet cycle)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingOnly = searchParams.get('pendingOnly') === 'true';

    const logs = await prisma.timeLog.findMany({
      where: {
        juniorId: targetJuniorId,
        startTime: { gte: thirtyDaysAgo },
        ...(pendingOnly ? { approved: false } : {}),
      },
      include: {
        task: { select: { title: true, case: { select: { caseNumber: true } } } },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Timesheet Fetch Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

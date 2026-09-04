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

    const { taskId, category = 'RESEARCH', startTime, endTime, description } = await req.json();

    if (!taskId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing taskId, startTime, or endTime' }, { status: 400 });
    }

    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const diffMs = endObj.getTime() - startObj.getTime();
    const durationHours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        juniorId: session.user.id,
        category,
        startTime: startObj,
        endTime: endObj,
        duration: durationHours,
        description: description || 'Manual time log entry',
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: {
        billableHours: { increment: durationHours },
      },
    });

    return NextResponse.json({ success: true, timeLog });
  } catch (error: any) {
    console.error('[TimeLog Manual Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

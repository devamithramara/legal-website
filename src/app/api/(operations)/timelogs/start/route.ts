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

    const { taskId, category = 'RESEARCH', description } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    // Stop any existing running timer for this junior
    const runningLog = await prisma.timeLog.findFirst({
      where: {
        juniorId: session.user.id,
        endTime: null,
      },
    });

    if (runningLog) {
      const now = new Date();
      const diffMs = now.getTime() - new Date(runningLog.startTime).getTime();
      const durationHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

      await prisma.timeLog.update({
        where: { id: runningLog.id },
        data: {
          endTime: now,
          duration: durationHours,
        },
      });
    }

    // Create new running TimeLog
    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        juniorId: session.user.id,
        category,
        startTime: new Date(),
        description: description || 'Active task session',
      },
    });

    // Update task status to IN_PROGRESS
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({ success: true, timeLog });
  } catch (error: any) {
    console.error('[TimeLog Start Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

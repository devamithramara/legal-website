import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeLogId = params.id;
    const { description } = await req.json().catch(() => ({}));

    const existingLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Time log not found.' }, { status: 404 });
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(existingLog.startTime).getTime();
    const durationHours = Math.max(0.05, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    const updatedLog = await prisma.timeLog.update({
      where: { id: timeLogId },
      data: {
        endTime: now,
        duration: durationHours,
        description: description || existingLog.description || 'Completed task timer session',
      },
    });

    // Accumulate billableHours on Task
    await prisma.task.update({
      where: { id: existingLog.taskId },
      data: {
        billableHours: { increment: durationHours },
      },
    });

    return NextResponse.json({ success: true, timeLog: updatedLog });
  } catch (error: any) {
    console.error('[TimeLog Stop Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

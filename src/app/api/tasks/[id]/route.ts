import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, billableHours, title, deadline } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Role protection: only ADMIN or the assigned JUNIOR can modify
    if ((session.user.role === Role.JUNIOR || session.user.role === Role.INTERN) && existingTask.assignedTo !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You are not assigned to this task.' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (billableHours !== undefined) updateData.billableHours = parseFloat(billableHours);
    if (title) updateData.title = title;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Get Tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let tasks: any[] = [];

    if (role === Role.ADMIN) {
      // Admin sees all tasks
      tasks = await prisma.task.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true } },
        },
        orderBy: { deadline: 'asc' },
      });
    } else if (role === Role.JUNIOR || role === Role.INTERN) {
      // Junior sees assigned tasks
      tasks = await prisma.task.findMany({
        where: { assignedTo: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { deadline: 'asc' },
      });
    } else {
      tasks = [];
    }

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create Task (Admin or Case Manager)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { caseId, assignedTo, title, deadline, status = 'TODO', billableHours = 0 } = body;

    if (!caseId || !assignedTo || !title) {
      return NextResponse.json({ error: 'Missing caseId, assignedTo, or title' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        caseId,
        assignedTo,
        title,
        status,
        deadline: deadline ? new Date(deadline) : null,
        billableHours: parseFloat(billableHours),
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

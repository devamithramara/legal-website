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

    const { role, id } = session.user;
    let dailyLogs;

    if (role === Role.ADMIN) {
      dailyLogs = await prisma.dailyLog.findMany({
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { date: 'desc' },
      });
    } else {
      dailyLogs = await prisma.dailyLog.findMany({
        where: { juniorId: id },
        orderBy: { date: 'desc' },
      });
    }

    return NextResponse.json({ success: true, dailyLogs });
  } catch (error: any) {
    console.error('[DailyLog GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tasksCompleted = [], hoursWorked, courtVisited = false, issues, escalate = false } = await req.json();

    if (hoursWorked === undefined || hoursWorked === null) {
      return NextResponse.json({ error: 'Missing hoursWorked parameter.' }, { status: 400 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Upsert or create today's daily log
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        juniorId: session.user.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    let dailyLog;
    if (existingLog) {
      dailyLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          tasksCompleted: Array.isArray(tasksCompleted) ? tasksCompleted : [tasksCompleted],
          hoursWorked: parseFloat(hoursWorked),
          courtVisited: Boolean(courtVisited),
          issues,
          escalate: Boolean(escalate),
          submittedAt: now,
        },
      });
    } else {
      dailyLog = await prisma.dailyLog.create({
        data: {
          juniorId: session.user.id,
          date: now,
          tasksCompleted: Array.isArray(tasksCompleted) ? tasksCompleted : [tasksCompleted],
          hoursWorked: parseFloat(hoursWorked),
          courtVisited: Boolean(courtVisited),
          issues,
          escalate: Boolean(escalate),
          submittedAt: now,
        },
      });
    }

    return NextResponse.json({ success: true, dailyLog });
  } catch (error: any) {
    console.error('[DailyLog POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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
    let escalations;

    if (role === Role.ADMIN) {
      escalations = await prisma.escalation.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      escalations = await prisma.escalation.findMany({
        where: { raisedBy: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, escalations });
  } catch (error: any) {
    console.error('[Escalations GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, reason = 'STRATEGY', description } = await req.json();

    if (!caseId || !description) {
      return NextResponse.json({ error: 'Missing caseId or description.' }, { status: 400 });
    }

    const escalation = await prisma.escalation.create({
      data: {
        caseId,
        raisedBy: session.user.id,
        reason,
        description,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, escalation });
  } catch (error: any) {
    console.error('[Escalation POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

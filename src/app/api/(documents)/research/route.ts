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
    let researchLogs;

    if (role === Role.ADMIN) {
      researchLogs = await prisma.researchLog.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      researchLogs = await prisma.researchLog.findMany({
        where: { juniorId: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, researchLogs });
  } catch (error: any) {
    console.error('[Research GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, sections = [], citations = [], source = 'SCC', summary } = await req.json();

    if (!caseId || !summary || summary.length < 10) {
      return NextResponse.json({ error: 'Summary must be at least 10 characters long.' }, { status: 400 });
    }

    const researchLog = await prisma.researchLog.create({
      data: {
        caseId,
        juniorId: session.user.id,
        sections: Array.isArray(sections) ? sections : [sections],
        citations: Array.isArray(citations) ? citations : [citations],
        source,
        summary,
        approved: false,
      },
    });

    return NextResponse.json({ success: true, researchLog });
  } catch (error: any) {
    console.error('[Research POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

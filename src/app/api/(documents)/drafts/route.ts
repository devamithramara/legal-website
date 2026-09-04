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
    let drafts;

    if (role === Role.ADMIN) {
      drafts = await prisma.draft.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      drafts = await prisma.draft.findMany({
        where: { juniorId: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('[Drafts GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, title, type = 'PETITION', fileUrl } = await req.json();

    if (!caseId || !title || !fileUrl) {
      return NextResponse.json({ error: 'Missing required parameters (caseId, title, fileUrl).' }, { status: 400 });
    }

    // Check if draft already exists to increment version
    const existing = await prisma.draft.findFirst({
      where: { caseId, title, juniorId: session.user.id },
      orderBy: { version: 'desc' },
    });

    const newVersion = existing ? existing.version + 1 : 1;

    const draft = await prisma.draft.create({
      data: {
        caseId,
        juniorId: session.user.id,
        title,
        type,
        status: 'UNDER_REVIEW',
        version: newVersion,
        fileUrl,
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Draft POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

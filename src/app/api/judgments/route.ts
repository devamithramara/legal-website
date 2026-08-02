import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let judgments;

    if (role === Role.ADMIN || role === Role.SENIOR) {
      judgments = await prisma.judgmentLibrary.findMany({
        where: {
          OR: [{ seniorId: id }, { isShared: true }],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      judgments = await prisma.judgmentLibrary.findMany({
        where: { isShared: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, judgments });
  } catch (error: any) {
    console.error('[Judgments GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, court, year, lawArea = 'CRIMINAL', fileUrl, highlights = [], tags = [], isShared = false } = await req.json();

    if (!title || !court || !year || !fileUrl) {
      return NextResponse.json({ error: 'Missing required judgment parameters.' }, { status: 400 });
    }

    const judgment = await prisma.judgmentLibrary.create({
      data: {
        seniorId: session.user.id,
        title,
        court,
        year: parseInt(year, 10),
        lawArea,
        fileUrl,
        highlights: Array.isArray(highlights) ? highlights : [highlights],
        tags: Array.isArray(tags) ? tags : [tags],
        isShared: Boolean(isShared),
      },
    });

    return NextResponse.json({ success: true, judgment });
  } catch (error: any) {
    console.error('[Judgments POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

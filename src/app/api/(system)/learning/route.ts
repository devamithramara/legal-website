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
    let learningItems;

    if (role === Role.ADMIN) {
      learningItems = await prisma.learningItem.findMany({
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      learningItems = await prisma.learningItem.findMany({
        where: { juniorId: id },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, learningItems });
  } catch (error: any) {
    console.error('[Learning GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { juniorId, title, type = 'BARE_ACT', content } = await req.json();

    if (!juniorId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields (juniorId, title, content).' }, { status: 400 });
    }

    const learningItem = await prisma.learningItem.create({
      data: {
        juniorId,
        assignedBy: session.user.id,
        title,
        type,
        content,
        status: 'ASSIGNED',
      },
    });

    return NextResponse.json({ success: true, learningItem });
  } catch (error: any) {
    console.error('[Learning POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

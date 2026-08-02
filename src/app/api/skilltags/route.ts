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

    const { searchParams } = new URL(req.url);
    const juniorId = searchParams.get('juniorId') || session.user.id;

    const tags = await prisma.skillTag.findMany({
      where: { juniorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tags });
  } catch (error: any) {
    console.error('[SkillTags GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { juniorId, tag } = await req.json();

    if (!juniorId || !tag) {
      return NextResponse.json({ error: 'Missing juniorId or tag parameter.' }, { status: 400 });
    }

    const skillTag = await prisma.skillTag.create({
      data: {
        juniorId,
        tag: tag.toUpperCase(),
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, skillTag });
  } catch (error: any) {
    console.error('[SkillTag POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

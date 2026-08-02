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

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error('[Templates GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { title, type = 'BAIL', fileUrl } = await req.json();

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Missing title or fileUrl parameter.' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        title,
        type,
        fileUrl,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('[Template POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

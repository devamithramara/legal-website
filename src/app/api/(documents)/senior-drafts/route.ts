import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const drafts = await prisma.seniorDraft.findMany({
      where: { seniorId: session.user.id },
      include: {
        case: { select: { caseNumber: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('[Senior Drafts GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, title, type = 'PETITION', content, exportUrl } = await req.json();

    if (!caseId || !title) {
      return NextResponse.json({ error: 'Missing caseId or title' }, { status: 400 });
    }

    const draft = await prisma.seniorDraft.create({
      data: {
        caseId,
        seniorId: session.user.id,
        title,
        type,
        content: content || '',
        status: 'DRAFTING',
        exportUrl,
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Senior Draft POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

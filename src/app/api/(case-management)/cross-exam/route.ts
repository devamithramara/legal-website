import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    const whereClause: any = { seniorId: session.user.id };
    if (caseId) whereClause.caseId = caseId;

    const builders = await prisma.crossExamBuilder.findMany({
      where: whereClause,
      include: {
        case: { select: { caseNumber: true, title: true } },
        questions: { orderBy: { order: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, builders });
  } catch (error: any) {
    console.error('[Cross-Exam GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, witnessName, witnessRole = 'PW1' } = await req.json();

    if (!caseId || !witnessName) {
      return NextResponse.json({ error: 'Missing caseId or witnessName' }, { status: 400 });
    }

    const builder = await prisma.crossExamBuilder.create({
      data: {
        caseId,
        seniorId: session.user.id,
        witnessName,
        witnessRole,
      },
    });

    return NextResponse.json({ success: true, builder });
  } catch (error: any) {
    console.error('[Cross-Exam POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

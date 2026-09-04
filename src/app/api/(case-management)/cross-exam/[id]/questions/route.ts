import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const builderId = params.id;
    const { theme = 'GENERAL', question, expectedAnswer, followUp, isTrap = false } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Missing question text.' }, { status: 400 });
    }

    const count = await prisma.crossExamQuestion.count({ where: { builderId } });

    const qItem = await prisma.crossExamQuestion.create({
      data: {
        builderId,
        order: count + 1,
        theme,
        question,
        expectedAnswer,
        followUp,
        isTrap: Boolean(isTrap),
      },
    });

    return NextResponse.json({ success: true, question: qItem });
  } catch (error: any) {
    console.error('[Cross-Exam Question Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

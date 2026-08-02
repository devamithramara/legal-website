import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const { status, rating, feedback } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Missing status parameter.' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status, // ASSIGNED | IN_PROGRESS | REVIEW | DONE
        rating: rating ? parseInt(rating, 10) : undefined,
        feedback: feedback || undefined,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[Task Status Update Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

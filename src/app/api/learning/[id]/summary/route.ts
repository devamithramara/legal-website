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

    const learningId = params.id;
    const { summary, status } = await req.json();

    if (!summary || summary.length < 15) {
      return NextResponse.json({ error: 'Summary must be a 3-line minimum (at least 15 characters).' }, { status: 400 });
    }

    const updatedItem = await prisma.learningItem.update({
      where: { id: learningId },
      data: {
        summary,
        status: status || 'READ',
      },
    });

    return NextResponse.json({ success: true, learningItem: updatedItem });
  } catch (error: any) {
    console.error('[Learning Summary Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

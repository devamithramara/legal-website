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

    const { summary, status } = await req.json();

    if (!['REVIEWED', 'REDO'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be REVIEWED or REDO.' }, { status: 400 });
    }

    const updated = await prisma.learningItem.update({
      where: { id: params.id },
      data: { summary: summary || undefined, status },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('[Learning Summary Review Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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

    const draftId = params.id;
    const { status, comments } = await req.json();

    if (!status || !['APPROVED', 'REDO'].includes(status)) {
      return NextResponse.json({ error: 'Invalid review status. Must be APPROVED or REDO.' }, { status: 400 });
    }

    const draft = await prisma.draft.update({
      where: { id: draftId },
      data: { status, comments: comments || null },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Draft Senior Review Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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

    const { content } = await req.json();

    const draft = await prisma.seniorDraft.update({
      where: { id: params.id, seniorId: session.user.id },
      data: { content: content || '' },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Senior Draft PATCH Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

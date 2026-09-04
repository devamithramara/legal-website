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

    const { approved } = await req.json();

    const updated = await prisma.researchLog.update({
      where: { id: params.id },
      data: { approved: Boolean(approved) },
    });

    return NextResponse.json({ success: true, research: updated });
  } catch (error: any) {
    console.error('[Research Approve Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

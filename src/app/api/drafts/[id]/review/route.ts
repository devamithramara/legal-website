import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const draftId = params.id;
    const { status, comments } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Missing status parameter.' }, { status: 400 });
    }

    const updatedDraft = await prisma.draft.update({
      where: { id: draftId },
      data: {
        status, // APPROVED | REDO | UNDER_REVIEW | FILED
        comments,
      },
    });

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (error: any) {
    console.error('[Draft Review Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

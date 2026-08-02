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

    const escalationId = params.id;
    const { status } = await req.json(); // ACKNOWLEDGED | RESOLVED

    if (!status) {
      return NextResponse.json({ error: 'Missing status parameter.' }, { status: 400 });
    }

    const updatedEscalation = await prisma.escalation.update({
      where: { id: escalationId },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, escalation: updatedEscalation });
  } catch (error: any) {
    console.error('[Escalation Update Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

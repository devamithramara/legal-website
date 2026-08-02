import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await prisma.postHearingNote.findMany({
      where: { seniorId: session.user.id },
      include: {
        case: { select: { caseNumber: true, title: true, court: true } },
      },
      orderBy: { hearingDate: 'desc' },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('[Post-Hearing GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

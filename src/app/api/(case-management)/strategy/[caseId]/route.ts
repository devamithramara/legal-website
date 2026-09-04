import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const strategy = await prisma.caseStrategy.findUnique({
      where: { caseId },
      include: {
        case: { select: { caseNumber: true, title: true, court: true } },
      },
    });

    const opponentProfiles = await prisma.opponentProfile.findMany({ where: { caseId } });

    return NextResponse.json({ success: true, strategy, opponentProfiles });
  } catch (error: any) {
    console.error('[Case Strategy GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

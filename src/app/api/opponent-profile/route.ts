import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, advocateName, firmName, behaviorNotes, winCount = 0, lossCount = 0 } = await req.json();

    if (!caseId || !advocateName) {
      return NextResponse.json({ error: 'Missing caseId or advocateName' }, { status: 400 });
    }

    const opponent = await prisma.opponentProfile.create({
      data: {
        caseId,
        seniorId: session.user.id,
        advocateName,
        firmName,
        behaviorNotes,
        winCount: parseInt(winCount, 10),
        lossCount: parseInt(lossCount, 10),
      },
    });

    return NextResponse.json({ success: true, opponent });
  } catch (error: any) {
    console.error('[Opponent Profile Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

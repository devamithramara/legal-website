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

    const { caseId, theory, keyArguments = [], weakPoints = [], counterArgs = [], caseStrength = 'MODERATE', strengthReason, sharedWith = [] } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });
    }

    const existing = await prisma.caseStrategy.findUnique({ where: { caseId } });

    let strategy;
    if (existing) {
      strategy = await prisma.caseStrategy.update({
        where: { caseId },
        data: {
          theory: theory || '',
          keyArguments: Array.isArray(keyArguments) ? keyArguments : [keyArguments],
          weakPoints: Array.isArray(weakPoints) ? weakPoints : [weakPoints],
          counterArgs: Array.isArray(counterArgs) ? counterArgs : [counterArgs],
          caseStrength,
          strengthReason,
          sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
          version: { increment: 1 },
        },
      });
    } else {
      strategy = await prisma.caseStrategy.create({
        data: {
          caseId,
          seniorId: session.user.id,
          theory: theory || '',
          keyArguments: Array.isArray(keyArguments) ? keyArguments : [keyArguments],
          weakPoints: Array.isArray(weakPoints) ? weakPoints : [weakPoints],
          counterArgs: Array.isArray(counterArgs) ? counterArgs : [counterArgs],
          caseStrength,
          strengthReason,
          sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
        },
      });
    }

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error('[Case Strategy POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

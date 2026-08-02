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
    const checklist = await prisma.hearingChecklist.findUnique({ where: { caseId } });

    return NextResponse.json({ success: true, checklist });
  } catch (error: any) {
    console.error('[Checklist GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const { documentsReady = false, argumentsDrafted = false, clientBriefed = false, juniorBriefed = false, vakalatnama = false, feeCollected = false } = await req.json();

    const items = [documentsReady, argumentsDrafted, clientBriefed, juniorBriefed, vakalatnama, feeCollected];
    const completedCount = items.filter(Boolean).length;
    const completionPct = Math.round((completedCount / 6) * 100);

    const checklist = await prisma.hearingChecklist.upsert({
      where: { caseId },
      update: {
        documentsReady,
        argumentsDrafted,
        clientBriefed,
        juniorBriefed,
        vakalatnama,
        feeCollected,
        completionPct,
      },
      create: {
        caseId,
        seniorId: session.user.id,
        documentsReady,
        argumentsDrafted,
        clientBriefed,
        juniorBriefed,
        vakalatnama,
        feeCollected,
        completionPct,
      },
    });

    return NextResponse.json({ success: true, checklist });
  } catch (error: any) {
    console.error('[Checklist POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

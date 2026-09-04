import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draftId = params.id;
    const { juniorId, notes } = await req.json();

    if (!juniorId) {
      return NextResponse.json({ error: 'Missing juniorId parameter.' }, { status: 400 });
    }

    const draft = await prisma.seniorDraft.findUnique({ where: { id: draftId } });
    if (!draft) {
      return NextResponse.json({ error: 'Senior draft not found.' }, { status: 404 });
    }

    // Create filing Task for junior
    const task = await prisma.task.create({
      data: {
        caseId: draft.caseId,
        assignedTo: juniorId,
        assignedBy: session.user.id,
        title: `Court Filing: ${draft.title}`,
        type: 'FILING',
        priority: 'URGENT',
        status: 'ASSIGNED',
        notes: notes || `Senior draft attached for court filing. Original draft ID: ${draft.id}`,
      },
    });

    // Update draft status to SENT_TO_JUNIOR
    await prisma.seniorDraft.update({
      where: { id: draftId },
      data: { status: 'SENT_TO_JUNIOR' },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[Senior Draft Send Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

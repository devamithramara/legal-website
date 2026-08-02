import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const juniorId = searchParams.get('juniorId');

    if (!juniorId) {
      return NextResponse.json({ error: 'Missing juniorId parameter.' }, { status: 400 });
    }

    const [
      junior,
      tasksAssigned,
      tasksCompleted,
      appearances,
      drafts,
      timeLogs,
      escalations,
      skillTags,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: juniorId },
        select: { id: true, name: true, email: true, phone: true, designation: true, createdAt: true },
      }),
      prisma.task.count({ where: { assignedTo: juniorId } }),
      prisma.task.count({ where: { assignedTo: juniorId, status: 'DONE' } }),
      prisma.appearance.count({ where: { juniorId } }),
      prisma.draft.findMany({ where: { juniorId }, select: { status: true } }),
      prisma.timeLog.findMany({ where: { juniorId, approved: true }, select: { duration: true } }),
      prisma.escalation.count({ where: { raisedBy: juniorId } }),
      prisma.skillTag.findMany({ where: { juniorId }, select: { tag: true } }),
    ]);

    if (!junior) {
      return NextResponse.json({ error: 'Junior not found.' }, { status: 404 });
    }

    const totalBillableHours = timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
    const draftsApproved = drafts.filter(d => d.status === 'APPROVED' || d.status === 'FILED').length;
    const draftsRedo = drafts.filter(d => d.status === 'REDO').length;

    return NextResponse.json({
      success: true,
      performance: {
        junior,
        tasksAssigned,
        tasksCompleted,
        completionRate: tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0,
        appearancesCount: appearances,
        draftsApproved,
        draftsRedo,
        totalBillableHours: Math.round(totalBillableHours * 10) / 10,
        escalationsRaised: escalations,
        skillTags: skillTags.map(st => st.tag),
      },
    });
  } catch (error: any) {
    console.error('[Junior Performance Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

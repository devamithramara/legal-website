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
    const brief = await prisma.clientBriefingNote.findUnique({ where: { caseId } });

    // Fetch recent events and call logs
    const [events, calls] = await Promise.all([
      prisma.caseEvent.findMany({
        where: { caseId },
        orderBy: { eventDate: 'desc' },
        take: 5,
      }),
      prisma.clientCallLog.findMany({
        where: { caseId },
        orderBy: { date: 'desc' },
        take: 3,
      }),
    ]);

    return NextResponse.json({ success: true, brief, events, calls });
  } catch (error: any) {
    console.error('[Client Brief GET Error]', error);
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
    const { privateNotes, clientFlags = [], reminders = [] } = await req.json();

    const brief = await prisma.clientBriefingNote.upsert({
      where: { caseId },
      update: {
        privateNotes: privateNotes || '',
        clientFlags: Array.isArray(clientFlags) ? clientFlags : [clientFlags],
        reminders: Array.isArray(reminders) ? reminders : [reminders],
      },
      create: {
        caseId,
        seniorId: session.user.id,
        privateNotes: privateNotes || '',
        clientFlags: Array.isArray(clientFlags) ? clientFlags : [clientFlags],
        reminders: Array.isArray(reminders) ? reminders : [reminders],
      },
    });

    return NextResponse.json({ success: true, brief });
  } catch (error: any) {
    console.error('[Client Brief POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

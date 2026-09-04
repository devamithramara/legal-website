import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, eventDate, notes } = body;

    if (!title || !eventDate) {
      return NextResponse.json({ error: 'Missing event title or eventDate' }, { status: 400 });
    }

    // Verify case exists
    const caseItem = await prisma.case.findUnique({
      where: { id },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Create the case event
    const event = await prisma.caseEvent.create({
      data: {
        caseId: id,
        eventDate: new Date(eventDate),
        title,
        notes: notes || null,
      },
    });

    // If this is a future hearing date, optionally sync it as the case nextHearing
    const eventTime = new Date(eventDate).getTime();
    const nowTime = Date.now();
    if (eventTime > nowTime && title.toLowerCase().includes('hearing')) {
      await prisma.case.update({
        where: { id },
        data: {
          nextHearing: new Date(eventDate),
        },
      });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error logging case event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

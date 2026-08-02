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
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, title, court, nextHearing, assignedTo } = body;

    // Fetch existing case to check transition
    const existingCase = await prisma.case.findUnique({
      where: { id },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Role protection: only ADMIN or the JUNIOR assigned to the case can modify it
    if ((session.user.role === Role.JUNIOR || session.user.role === Role.INTERN) && existingCase.assignedTo !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You are not assigned to this case.' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (court) updateData.court = court;
    if (nextHearing !== undefined) updateData.nextHearing = nextHearing ? new Date(nextHearing) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const updatedCase = await prisma.case.update({
      where: { id },
      data: updateData,
    });

    // Auto-log case timeline events when status changes
    if (status && status !== existingCase.status) {
      await prisma.caseEvent.create({
        data: {
          caseId: id,
          eventDate: new Date(),
          title: `Status Changed to ${status}`,
          notes: `Case pipeline updated from ${existingCase.status} to ${status} by ${session.user.name}.`,
        },
      });
    }

    return NextResponse.json({ success: true, case: updatedCase });
  } catch (error: any) {
    console.error('Error updating case:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

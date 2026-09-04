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
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { juniorId } = body;

    const caseItem = await prisma.case.findUnique({
      where: { id },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    let juniorName = 'None';
    if (juniorId) {
      const junior = await prisma.user.findFirst({
        where: { id: juniorId, role: { in: [Role.JUNIOR, Role.INTERN] } },
      });
      if (!junior) {
        return NextResponse.json({ error: 'Selected user is not a Junior Advocate or Intern' }, { status: 400 });
      }
      juniorName = junior.name;
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        assignedTo: juniorId || null,
      },
    });

    // Log this assignment event on the case timeline
    await prisma.caseEvent.create({
      data: {
        caseId: id,
        eventDate: new Date(),
        title: 'Advocate Assigned',
        notes: juniorId 
          ? `Case assigned to Junior Advocate: ${juniorName}.`
          : 'Junior Advocate assignment removed.',
      },
    });

    return NextResponse.json({ success: true, case: updatedCase });
  } catch (error: any) {
    console.error('Error assigning case:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

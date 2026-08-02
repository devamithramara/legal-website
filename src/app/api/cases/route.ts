import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, CaseStatus } from '@prisma/client';

// Get Cases (role-filtered)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let cases;

    if (role === Role.ADMIN) {
      cases = await prisma.case.findMany({
        include: {
          client: { select: { name: true, email: true, phone: true } },
          junior: { select: { id: true, name: true } },
          events: true,
          documents: true,
          tasks: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === Role.JUNIOR || role === Role.INTERN) {
      cases = await prisma.case.findMany({
        where: { assignedTo: id },
        include: {
          client: { select: { name: true, email: true, phone: true } },
          events: true,
          documents: true,
          tasks: { where: { assignedTo: id } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Client role
      cases = await prisma.case.findMany({
        where: { clientId: id },
        include: {
          junior: { select: { name: true, email: true } },
          events: true,
          documents: true,
          tasks: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(cases);
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create Case (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, caseNumber, title, type, court, nextHearing, assignedTo } = body;

    if (!clientId || !caseNumber || !title || !type || !court) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check unique case number
    const existing = await prisma.case.findUnique({
      where: { caseNumber },
    });
    if (existing) {
      return NextResponse.json({ error: 'A case with this number already exists.' }, { status: 400 });
    }

    const newCase = await prisma.case.create({
      data: {
        clientId,
        caseNumber,
        title,
        type,
        court,
        status: CaseStatus.INTAKE,
        nextHearing: nextHearing ? new Date(nextHearing) : null,
        assignedTo: assignedTo || null,
      },
    });

    // Create initial CaseEvent
    await prisma.caseEvent.create({
      data: {
        caseId: newCase.id,
        eventDate: new Date(),
        title: 'Case Registered',
        notes: `Case registered in firm system. Assigned Court: ${court}.`,
      },
    });

    return NextResponse.json({ success: true, case: newCase });
  } catch (error: any) {
    console.error('Error creating case:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

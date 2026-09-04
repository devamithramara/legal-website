import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// ─── GET /api/cases/[id] — Full case detail with events, documents, tasks ────
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const caseDetail = await prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        type: true,
        status: true,
        nextHearing: true,
        court: true,
        createdAt: true,
        assignedTo: true,
        clientId: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        junior: { select: { id: true, name: true } },
        events: {
          select: { id: true, title: true, eventDate: true, notes: true },
          orderBy: { eventDate: 'desc' },
          take: 50,
        },
        documents: {
          select: { id: true, name: true, url: true, type: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        tasks: {
          select: { id: true, title: true, status: true, billableHours: true, deadline: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!caseDetail) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Role guard: juniors can only see their own cases
    if (
      (session.user.role === Role.JUNIOR || session.user.role === Role.INTERN) &&
      caseDetail.assignedTo !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.user.role === Role.CLIENT && caseDetail.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(caseDetail, {
      headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=30' },
    });
  } catch (error: any) {
    console.error('Error fetching case detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── PATCH /api/cases/[id] — Update case fields ──────────────────────────────
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

    const existingCase = await prisma.case.findUnique({ where: { id } });
    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (
      (session.user.role === Role.JUNIOR || session.user.role === Role.INTERN) &&
      existingCase.assignedTo !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden. You are not assigned to this case.' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (court) updateData.court = court;
    if (nextHearing !== undefined) updateData.nextHearing = nextHearing ? new Date(nextHearing) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const updatedCase = await prisma.case.update({ where: { id }, data: updateData });

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

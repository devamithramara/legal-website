import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, CaseStatus } from '@prisma/client';

// ─── Shared lean select (no nested heavy relations) ────────────────────────
const CASE_LIST_SELECT = {
  id: true,
  caseNumber: true,
  title: true,
  type: true,
  status: true,
  nextHearing: true,
  court: true,
  createdAt: true,
  client: { select: { id: true, name: true, email: true, phone: true } },
  junior: { select: { id: true, name: true } },
} as const;

// GET /api/cases — lightweight list without nested events/documents/tasks
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
        select: CASE_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        take: 200, // hard cap — paginate if needed later
      });
    } else if (role === Role.JUNIOR || role === Role.INTERN) {
      cases = await prisma.case.findMany({
        where: { assignedTo: id },
        select: CASE_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === Role.SENIOR) {
      cases = await prisma.case.findMany({
        where: { seniorId: id },
        select: CASE_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // CLIENT role
      cases = await prisma.case.findMany({
        where: { clientId: id },
        select: {
          ...CASE_LIST_SELECT,
          junior: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(cases, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cases — Admin only
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

    const existing = await prisma.case.findUnique({ where: { caseNumber } });
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

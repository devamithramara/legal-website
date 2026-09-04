import { prisma } from '@/lib/prisma';
import { Role, CaseStatus } from '@prisma/client';

/**
 * Case service — centralizes all case-related Prisma queries.
 * Used by API route handlers to keep route files thin.
 */

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

const CASE_DETAIL_SELECT = {
  ...CASE_LIST_SELECT,
  seniorId: true,
  updatedAt: true,
  events: { select: { id: true, eventDate: true, title: true, notes: true }, orderBy: { eventDate: 'desc' as const } },
  documents: { select: { id: true, name: true, url: true, type: true, createdAt: true } },
  tasks: { select: { id: true, title: true, status: true, deadline: true, billableHours: true } },
} as const;

/** List cases filtered by user role */
export async function listCases(userId: string, role: Role) {
  if (role === Role.ADMIN) {
    return prisma.case.findMany({
      select: CASE_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === Role.SENIOR) {
    return prisma.case.findMany({
      where: { seniorId: userId },
      select: CASE_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === Role.JUNIOR || role === Role.INTERN) {
    return prisma.case.findMany({
      where: { assignedTo: userId },
      select: CASE_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  if (role === Role.CLIENT) {
    return prisma.case.findMany({
      where: { clientId: userId },
      select: CASE_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  return [];
}

/** Get a single case with full details */
export async function getCase(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: CASE_DETAIL_SELECT,
  });
}

/** Create a new case */
export async function createCase(data: {
  clientId: string;
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  nextHearing?: Date | null;
  assignedTo?: string | null;
  seniorId?: string | null;
}) {
  return prisma.case.create({ data });
}

/** Assign a junior to a case */
export async function assignCase(caseId: string, juniorId: string) {
  return prisma.case.update({
    where: { id: caseId },
    data: { assignedTo: juniorId },
  });
}

/** Update case status */
export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  return prisma.case.update({
    where: { id: caseId },
    data: { status },
  });
}

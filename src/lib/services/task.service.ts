import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Task service — centralizes task-related Prisma queries.
 */

const TASK_LIST_SELECT = {
  id: true,
  title: true,
  status: true,
  type: true,
  priority: true,
  deadline: true,
  billableHours: true,
  notes: true,
  rating: true,
  feedback: true,
  createdAt: true,
  case: { select: { caseNumber: true, title: true } },
  junior: { select: { id: true, name: true } },
} as const;

/** List tasks filtered by user role */
export async function listTasks(userId: string, role: Role) {
  if (role === Role.ADMIN) {
    return prisma.task.findMany({
      select: TASK_LIST_SELECT,
      orderBy: { deadline: 'asc' },
    });
  }

  if (role === Role.JUNIOR || role === Role.INTERN) {
    return prisma.task.findMany({
      where: { assignedTo: userId },
      select: TASK_LIST_SELECT,
      orderBy: { deadline: 'asc' },
    });
  }

  if (role === Role.SENIOR) {
    return prisma.task.findMany({
      where: { assignedBy: userId },
      select: TASK_LIST_SELECT,
      orderBy: { deadline: 'asc' },
    });
  }

  return [];
}

/** Create a new task */
export async function createTask(data: {
  caseId: string;
  assignedTo: string;
  assignedBy?: string;
  title: string;
  type?: string;
  priority?: string;
  status?: string;
  deadline?: Date | null;
  notes?: string;
  billableHours?: number;
}) {
  return prisma.task.create({
    data: {
      caseId: data.caseId,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
      title: data.title,
      type: data.type ?? 'RESEARCH',
      priority: data.priority ?? 'NORMAL',
      status: data.status ?? 'ASSIGNED',
      deadline: data.deadline ?? null,
      notes: data.notes,
      billableHours: data.billableHours ?? 0,
    },
  });
}

/** Update task status */
export async function updateTaskStatus(taskId: string, status: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status, updatedAt: new Date() },
  });
}

/** Assign rating and feedback to a task */
export async function rateTask(taskId: string, rating: number, feedback?: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: { rating, feedback, status: 'DONE' },
  });
}

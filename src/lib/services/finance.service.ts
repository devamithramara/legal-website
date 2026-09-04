import { prisma } from '@/lib/prisma';

/**
 * Finance service — centralizes invoice, expense, and ledger queries.
 */

/** List all invoices with client info */
export async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/** Get a single invoice by ID */
export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
}

/** Create an expense and corresponding ledger transaction */
export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  date?: Date;
  description?: string;
}) {
  const expenseDate = data.date ?? new Date();

  const [expense, transaction] = await prisma.$transaction([
    prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: expenseDate,
        description: data.description ?? null,
      },
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTFLOW',
        amount: data.amount,
        category: data.category,
        date: expenseDate,
        description: `Expense: ${data.title}`,
      },
    }),
  ]);

  return { expense, transaction };
}

/** Get ledger entries (transactions) with optional date range */
export async function getLedger(startDate?: Date, endDate?: Date) {
  const where: Record<string, unknown> = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, Date>).gte = startDate;
    if (endDate) (where.date as Record<string, Date>).lte = endDate;
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}

/** Financial summary for dashboard */
export async function getFinanceSummary() {
  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({ select: { amount: true, status: true } }),
    prisma.expense.findMany({ select: { amount: true } }),
  ]);

  const totalRevenue = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const pendingInvoices = invoices.filter((i) => i.status === 'UNPAID').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE').length;

  return {
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    pendingInvoices,
    overdueInvoices,
  };
}

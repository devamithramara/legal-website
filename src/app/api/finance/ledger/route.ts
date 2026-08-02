import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    // Fetch all transactions
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });

    // Fetch all expenses
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    // Fetch all invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculations
    const totalInflow = transactions
      .filter((t) => t.type === 'INFLOW')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = transactions
      .filter((t) => t.type === 'OUTFLOW')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalInflow - totalOutflow;

    return NextResponse.json({
      transactions,
      expenses,
      invoices,
      summary: {
        totalRevenue: totalInflow,
        totalExpenses: totalOutflow,
        netProfit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching ledger details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

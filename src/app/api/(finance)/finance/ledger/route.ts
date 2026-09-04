import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    // Default: last 90 days. Pass ?days=365 for yearly view
    const days = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Run all three queries in parallel with date filter + take caps
    const [transactions, expenses, invoices, inflowAgg, outflowAgg] = await Promise.all([
      prisma.transaction.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'desc' },
        take: 500,
      }),
      prisma.expense.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'desc' },
        take: 500,
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          dueDate: true,
          pdfUrl: true,
          gstNumber: true,
          clientId: true,
          client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      // DB-level aggregation for totals — much faster than JS reduce on full table
      prisma.transaction.aggregate({
        where: { type: 'INFLOW' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'OUTFLOW' },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = inflowAgg._sum.amount ?? 0;
    const totalExpenses = outflowAgg._sum.amount ?? 0;
    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json(
      {
        transactions,
        expenses,
        invoices,
        summary: { totalRevenue, totalExpenses, netProfit },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching ledger details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

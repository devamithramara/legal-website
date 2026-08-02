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

    // Get transactions over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    // Group transactions by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

    // Initialize last 6 months
    const currentMonth = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlyData[label] = { revenue: 0, expenses: 0 };
    }

    // Populate data
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      if (monthlyData[label]) {
        if (t.type === 'INFLOW') {
          monthlyData[label].revenue += t.amount;
        } else {
          monthlyData[label].expenses += t.amount;
        }
      }
    });

    const labels = Object.keys(monthlyData);
    const revenues = labels.map((l) => monthlyData[l].revenue);
    const expenses = labels.map((l) => monthlyData[l].expenses);

    return NextResponse.json({
      labels,
      revenues,
      expenses,
    });
  } catch (error: any) {
    console.error('Error calculating monthly revenue analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

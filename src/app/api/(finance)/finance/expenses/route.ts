import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, amount, category, date, description } = body;

    if (!title || amount === undefined || !category) {
      return NextResponse.json({ error: 'Missing title, amount, or category' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const expenseDate = date ? new Date(date) : new Date();

    // Create Expense in database
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parsedAmount,
        category,
        date: expenseDate,
        description,
      },
    });

    // Write OUTFLOW transaction to ledger
    await prisma.transaction.create({
      data: {
        type: 'OUTFLOW',
        amount: parsedAmount,
        category,
        date: expenseDate,
        referenceId: expense.id,
        description: `Expense logged: ${title} (${category})`,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error('Error logging expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

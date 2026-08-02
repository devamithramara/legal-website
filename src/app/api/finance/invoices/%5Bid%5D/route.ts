import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, InvoiceStatus } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    // If transitioned from UNPAID/OVERDUE to PAID, log inflow transaction
    if (status === InvoiceStatus.PAID && existingInvoice.status !== InvoiceStatus.PAID) {
      await prisma.transaction.create({
        data: {
          type: 'INFLOW',
          amount: existingInvoice.amount,
          category: 'Legal Fees',
          referenceId: id,
          description: `Settle invoice ID: ${id} payment`,
        },
      });
    }

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

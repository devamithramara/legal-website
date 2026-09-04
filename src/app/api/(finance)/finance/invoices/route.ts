import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, InvoiceStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, amount, gstNumber, dueDate, status = InvoiceStatus.UNPAID } = body;

    if (!clientId || amount === undefined) {
      return NextResponse.json({ error: 'Missing clientId or amount' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const invoiceDueDate = dueDate ? new Date(dueDate) : null;

    // Create the invoice
    // We can save a placeholder pdfUrl for now, e.g. /invoices/invoice-[id].pdf
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        amount: parsedAmount,
        gstNumber,
        status,
        dueDate: invoiceDueDate,
      },
    });

    // Update with correct pdfUrl containing ID
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        pdfUrl: `/api/finance/invoices/${invoice.id}/print`,
      },
    });

    // If status is PAID, write INFLOW transaction to ledger
    if (status === InvoiceStatus.PAID) {
      await prisma.transaction.create({
        data: {
          type: 'INFLOW',
          amount: parsedAmount,
          category: 'Legal Fees',
          referenceId: invoice.id,
          description: `Paid invoice generated for client ID: ${clientId}`,
        },
      });
    }

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

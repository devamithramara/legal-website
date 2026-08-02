import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;

    let documents;

    if (role === Role.ADMIN) {
      // Admin sees all documents
      documents = await prisma.document.findMany({
        include: {
          uploadedBy: { select: { name: true } },
          case: { select: { caseNumber: true, title: true } },
          appointment: { select: { date: true, timeSlot: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === Role.JUNIOR || role === Role.INTERN) {
      // Junior sees documents for their assigned cases
      documents = await prisma.document.findMany({
        where: {
          case: { assignedTo: id },
        },
        include: {
          uploadedBy: { select: { name: true } },
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Clients see their own documents
      documents = await prisma.document.findMany({
        where: { uploadedById: id },
        include: {
          uploadedBy: { select: { name: true } },
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

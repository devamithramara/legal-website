import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, type, caseId, appointmentId } = body;

    if (!name || !url || !type) {
      return NextResponse.json({ error: 'Missing name, url, or type parameters' }, { status: 400 });
    }

    const uploadedById = session.user.id;

    // Save Document metadata
    const document = await prisma.document.create({
      data: {
        name,
        url,
        type,
        uploadedById,
        caseId: caseId || null,
        appointmentId: appointmentId || null,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error('Error saving document details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { rating, comment, caseType } = body;

    if (!rating || !comment || !caseType) {
      return NextResponse.json({ error: 'Please provide rating, review text, and case type.' }, { status: 400 });
    }

    const clientId = session.user.id;

    // Save testimonial directly (bypassing CLOSED case check)
    const newTestimonial = await prisma.testimonial.create({
      data: {
        clientId,
        rating: parseInt(rating),
        body: comment,
        caseType,
        verified: true, // Mock-verified
      },
    });

    return NextResponse.json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error('Error creating mock testimonial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CaseStatus } from '@prisma/client';

// Fetch all testimonials
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Submit a testimonial
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

    // BCI & BCM Rules: Review can only be unlocked after at least one CLOSED case.
    // Query if this client has any CLOSED case.
    const closedCase = await prisma.case.findFirst({
      where: {
        clientId: clientId,
        status: CaseStatus.CLOSED,
      },
    });

    if (!closedCase) {
      return NextResponse.json({
        error: 'Testimonial submission is restricted to clients with at least one concluded (CLOSED) case.',
      }, { status: 403 });
    }

    // Create the testimonial
    const newTestimonial = await prisma.testimonial.create({
      data: {
        clientId,
        rating: parseInt(rating),
        body: comment,
        caseType,
        verified: true, // Auto-verified since they have a closed case
      },
    });

    return NextResponse.json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

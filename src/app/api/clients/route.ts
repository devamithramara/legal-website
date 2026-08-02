import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Helper for database reconnect on Neon cold starts
async function withPrismaRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.code === 'P1001' || error?.message?.includes("Can't reach database"))) {
      console.warn(`[Prisma DB Reconnect] Retrying /api/clients... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, 1000));
      return withPrismaRetry(fn, retries - 1);
    }
    throw error;
  }
}

// Get Clients List (Admin & Junior Advocates)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = session.user;
    if (role !== Role.ADMIN && role !== Role.JUNIOR && role !== Role.INTERN) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const clients = await withPrismaRetry(() =>
      prisma.user.findMany({
        where: { role: Role.CLIENT },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          appointments: {
            select: { id: true, date: true, status: true },
            orderBy: { date: 'desc' },
          },
          clientCases: {
            select: { id: true, caseNumber: true, title: true, court: true, status: true },
            orderBy: { createdAt: 'desc' },
          },
          invoices: {
            select: { id: true, amount: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      })
    );

    return NextResponse.json(clients, {
      headers: {
        'Cache-Control': 'private, max-age=2, stale-while-revalidate=5',
      },
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create Client User (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing client name or email address' }, { status: 400 });
    }

    // Check unique email
    const existing = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
    );

    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
    }

    // Default password to 'client123' if not provided
    const defaultPassword = password || 'client123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const client = await withPrismaRetry(() =>
      prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          role: Role.CLIENT,
          password: hashedPassword,
        },
      })
    );

    return NextResponse.json({ success: true, client: { id: client.id, name: client.name, email: client.email } });
  } catch (error: any) {
    console.error('Error creating client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Get Clients List (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const clients = await prisma.user.findMany({
      where: { role: Role.CLIENT },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        appointments: { select: { id: true, date: true, status: true } },
        clientCases: { select: { id: true, caseNumber: true, status: true } },
        invoices: { select: { id: true, amount: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
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
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
    }

    // Default password to 'client123' if not provided
    const defaultPassword = password || 'client123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const client = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        role: Role.CLIENT,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, client: { id: client.id, name: client.name, email: client.email } });
  } catch (error: any) {
    console.error('Error creating client user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

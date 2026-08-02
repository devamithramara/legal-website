import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ─── GET /api/juniors ────────────────────────────────────────────────────────
// Returns all JUNIOR and INTERN users with workload stats.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.JUNIOR && session.user.role !== Role.INTERN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const juniors = await prisma.user.findMany({
      where: { role: { in: [Role.JUNIOR, Role.INTERN] } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        designation: true,
        createdAt: true,
        juniorCases: {
          select: {
            id: true,
            status: true,
          },
        },
        juniorTasks: {
          select: {
            id: true,
            status: true,
            billableHours: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedJuniors = juniors.map((j) => {
      const activeCases = j.juniorCases.filter((c) => c.status !== 'CLOSED').length;
      const totalTasks = j.juniorTasks.length;
      const pendingTasks = j.juniorTasks.filter((t) => t.status !== 'DONE').length;
      const totalHours = j.juniorTasks.reduce((sum, t) => sum + t.billableHours, 0);

      return {
        id: j.id,
        name: j.name,
        email: j.email,
        phone: j.phone,
        role: j.role,
        designation: j.designation || (j.role === 'INTERN' ? 'Intern' : 'Junior Advocate'),
        createdAt: j.createdAt,
        caseloadCount: activeCases,
        totalTasks,
        pendingTasks,
        billableHours: totalHours,
      };
    });

    return NextResponse.json(formattedJuniors);
  } catch (error: any) {
    console.error('Error fetching juniors list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST /api/juniors ───────────────────────────────────────────────────────
// Creates a new JUNIOR or INTERN user. Admin only.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, role = 'JUNIOR', designation, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Validate role is JUNIOR or INTERN only
    if (role !== 'JUNIOR' && role !== 'INTERN') {
      return NextResponse.json({ error: 'Role must be JUNIOR or INTERN.' }, { status: 400 });
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash password (default: name + "123" if not provided)
    const rawPassword = password || `${name.split(' ')[0].toLowerCase()}123`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role as Role,
        designation: designation || (role === 'INTERN' ? 'Intern' : 'Junior Advocate'),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        designation: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user, generatedPassword: rawPassword });
  } catch (error: any) {
    console.error('[Create Junior/Intern Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ─── DELETE /api/juniors ─────────────────────────────────────────────────────
// Removes a JUNIOR or INTERN user by ID. Admin only.
// Unassigns them from any cases and deletes their tasks first.
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Verify user exists and is JUNIOR or INTERN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.role !== Role.JUNIOR && user.role !== Role.INTERN) {
      return NextResponse.json({ error: 'Can only remove Junior or Intern users.' }, { status: 400 });
    }

    // Unassign from all cases
    await prisma.case.updateMany({
      where: { assignedTo: userId },
      data: { assignedTo: null },
    });

    // Delete their tasks
    await prisma.task.deleteMany({
      where: { assignedTo: userId },
    });

    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: `${user.name} has been removed.` });
  } catch (error: any) {
    console.error('[Delete Junior/Intern Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

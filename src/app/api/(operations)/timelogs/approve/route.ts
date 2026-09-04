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

    const { logIds, approved = true } = await req.json();

    if (!Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json({ error: 'Missing logIds array' }, { status: 400 });
    }

    await prisma.timeLog.updateMany({
      where: { id: { in: logIds } },
      data: { approved },
    });

    return NextResponse.json({ success: true, count: logIds.length, approved });
  } catch (error: any) {
    console.error('[Timesheet Approve Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

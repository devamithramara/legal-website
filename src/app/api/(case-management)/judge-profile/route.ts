import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const judges = await prisma.judgeProfile.findMany({
      where: { seniorId: session.user.id },
      orderBy: { judgeName: 'asc' },
    });

    return NextResponse.json({ success: true, judges });
  } catch (error: any) {
    console.error('[Judge Profile GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { judgeName, court, notes } = await req.json();

    if (!judgeName || !court) {
      return NextResponse.json({ error: 'Missing judgeName or court' }, { status: 400 });
    }

    const judge = await prisma.judgeProfile.create({
      data: {
        seniorId: session.user.id,
        judgeName,
        court,
        notes,
      },
    });

    return NextResponse.json({ success: true, judge });
  } catch (error: any) {
    console.error('[Judge Profile POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

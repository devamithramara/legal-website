import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let items;

    if (role === Role.ADMIN || role === Role.SENIOR) {
      items = await prisma.precedentVault.findMany({
        where: {
          OR: [
            { seniorId: id },
            { isShared: true },
            { sharedWith: { has: id } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      items = await prisma.precedentVault.findMany({
        where: {
          OR: [
            { isShared: true },
            { sharedWith: { has: id } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('[Precedent Vault GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type = 'ARGUMENT', content, lawArea = 'CRIMINAL', court, year, tags = [], isShared = false, sharedWith = [] } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content.' }, { status: 400 });
    }

    const item = await prisma.precedentVault.create({
      data: {
        seniorId: session.user.id,
        title,
        type,
        content,
        lawArea,
        court,
        year: year ? parseInt(year, 10) : null,
        tags: Array.isArray(tags) ? tags : [tags],
        isShared: Boolean(isShared),
        sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('[Precedent Vault POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

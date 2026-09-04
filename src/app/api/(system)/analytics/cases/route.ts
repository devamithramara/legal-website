import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, CaseStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    // Run all aggregations in parallel — no full table scan, no include:client
    const [statusGroups, typeGroups, closedCases, recentCases] = await Promise.all([
      // 1. Status distribution — pure DB groupBy, never loads rows into JS
      prisma.case.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      // 2. Type/practice area distribution
      prisma.case.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      // 3. Only closed cases, only fields needed for avg resolution calc
      prisma.case.findMany({
        where: { status: CaseStatus.CLOSED },
        select: { createdAt: true, updatedAt: true },
      }),
      // 4. Last 6 months cases — only createdAt + status needed for timeline
      prisma.case.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: { createdAt: true, updatedAt: true, status: true },
      }),
    ]);

    // Build status counts map
    const statusCounts: Record<string, number> = {
      INTAKE: 0, ACTIVE: 0, ARGUED: 0, JUDGMENT: 0, CLOSED: 0,
    };
    statusGroups.forEach((g) => {
      statusCounts[g.status] = g._count._all;
    });

    // Build type counts map
    const typeCounts: Record<string, number> = {};
    typeGroups.forEach((g) => {
      typeCounts[g.type] = g._count._all;
    });

    // Average resolution time
    let avgResolutionTime = 45;
    if (closedCases.length > 0) {
      const totalDays = closedCases.reduce((sum, c) => {
        const diff = Math.max(1, Math.round(
          (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 86400000
        ));
        return sum + diff;
      }, 0);
      avgResolutionTime = Math.round(totalDays / closedCases.length);
    }

    // Opened vs Closed timeline (last 6 months)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const openedVsClosed: Record<string, { opened: number; closed: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
      openedVsClosed[label] = { opened: 0, closed: 0 };
    }
    recentCases.forEach((c) => {
      const openLabel = `${months[new Date(c.createdAt).getMonth()]} ${String(new Date(c.createdAt).getFullYear()).slice(-2)}`;
      if (openedVsClosed[openLabel]) openedVsClosed[openLabel].opened += 1;
      if (c.status === CaseStatus.CLOSED) {
        const closeLabel = `${months[new Date(c.updatedAt).getMonth()]} ${String(new Date(c.updatedAt).getFullYear()).slice(-2)}`;
        if (openedVsClosed[closeLabel]) openedVsClosed[closeLabel].closed += 1;
      }
    });

    const timelineLabels = Object.keys(openedVsClosed);

    // Top 3 practice areas
    const sortedTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json(
      {
        statusCounts,
        typeCounts,
        avgResolutionTime,
        openedVsClosed: {
          labels: timelineLabels,
          opened: timelineLabels.map((l) => openedVsClosed[l].opened),
          closed: timelineLabels.map((l) => openedVsClosed[l].closed),
        },
        topPracticeAreas: sortedTypes,
        totalCases: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching case analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

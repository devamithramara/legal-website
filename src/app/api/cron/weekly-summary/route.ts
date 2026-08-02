import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return handleWeeklySummary();
}

export async function POST() {
  return handleWeeklySummary();
}

async function handleWeeklySummary() {
  try {
    const seniors = await prisma.user.findMany({
      where: { role: 'SENIOR' },
      select: { id: true, name: true, email: true },
    });

    const results = [];
    for (const senior of seniors) {
      const casesCount = await prisma.case.count({ where: { seniorId: senior.id, status: 'ACTIVE' } });
      const outcomesCount = await prisma.caseOutcome.count({ where: { seniorId: senior.id } });

      console.log(`[Weekly Summary Digest MOCK Email] To: ${senior.email} | Senior: ${senior.name} | Active Cases: ${casesCount} | Outcomes: ${outcomesCount}`);
      results.push({ senior: senior.name, activeCases: casesCount, outcomesCount });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (error: any) {
    console.error('[Weekly Summary Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * GET /api/admin/dashboard
 * Single consolidated endpoint — replaces 5 separate API calls on admin homepage.
 * All queries run in parallel. Only fields needed for dashboard cards are fetched.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalClients,
      activeCasesCount,
      appointmentsToday,
      recentAppointments,
      recentCaseEvents,
      recentInvoices,
      monthlyRevenue,
      clients,
      juniors,
    ] = await Promise.all([
      // Metric: total client count (scalar — instant)
      prisma.user.count({ where: { role: Role.CLIENT } }),

      // Metric: active cases count (scalar)
      prisma.case.count({ where: { status: { notIn: ['CLOSED', 'INTAKE'] } } }),

      // Metric: today's appointments count (scalar)
      prisma.appointment.count({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),

      // Activity: last 5 appointments — minimal fields
      prisma.appointment.findMany({
        where: { date: { gte: todayStart } },
        select: {
          id: true,
          date: true,
          timeSlot: true,
          caseType: true,
          status: true,
          client: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
        take: 5,
      }),

      // Activity: last 5 case events — minimal fields
      prisma.caseEvent.findMany({
        select: {
          id: true,
          title: true,
          eventDate: true,
          case: { select: { caseNumber: true } },
        },
        orderBy: { eventDate: 'desc' },
        take: 5,
      }),

      // Activity: last 5 invoices — minimal fields
      prisma.invoice.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Metric: monthly revenue via DB aggregation (no row loading)
      prisma.transaction.aggregate({
        where: {
          type: 'INFLOW',
          date: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),

      // Dropdown data for Add Client / Add Case forms
      prisma.user.findMany({
        where: { role: Role.CLIENT },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
        take: 200,
      }),

      // Dropdown data for Assign Junior in Add Case form
      prisma.user.findMany({
        where: { role: { in: [Role.JUNIOR, Role.INTERN] } },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Build unified activity feed
    const activities = [
      ...recentAppointments.map((a) => ({
        id: a.id,
        type: 'appointment' as const,
        title: `Appointment: ${a.client.name}`,
        detail: `${a.caseType} — ${a.timeSlot} (${a.status})`,
        date: a.date,
      })),
      ...recentCaseEvents.map((e) => ({
        id: e.id,
        type: 'case_event' as const,
        title: e.title,
        detail: `Case ${e.case.caseNumber}`,
        date: e.eventDate,
      })),
      ...recentInvoices.map((i) => ({
        id: i.id,
        type: 'invoice' as const,
        title: `Invoice: ₹${i.amount.toLocaleString('en-IN')}`,
        detail: `${i.client.name} — ${i.status}`,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return NextResponse.json(
      {
        metrics: {
          totalClients,
          activeCases: activeCasesCount,
          appointmentsToday,
          monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
        },
        activities,
        clients,
        juniors,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=20, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('[Admin Dashboard API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

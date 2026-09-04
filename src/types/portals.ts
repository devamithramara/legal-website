/**
 * Portal-specific types for dashboard data and portal-level state.
 */

// ─── Admin Portal ───────────────────────────────────────────────────────────────

export interface AdminDashboardMetrics {
  totalClients: number;
  activeCases: number;
  monthlyRevenue: number;
  appointmentsToday: number;
}

export interface AdminActivityItem {
  id: string;
  type: 'appointment' | 'case_event' | 'invoice';
  title: string;
  detail: string;
  date: string;
}

// ─── Senior Advocate Portal ─────────────────────────────────────────────────────

export interface SeniorDashboardMetrics {
  activeCases: number;
  upcomingHearings: number;
  pendingReviews: number;
  openEscalations: number;
}

export interface SeniorNotificationItem {
  id: string;
  type: 'ESCALATION' | 'PAYMENT' | 'CHECKLIST' | 'FILING' | 'DIGEST';
  title: string;
  body: string;
  caseId?: string | null;
  read: boolean;
  createdAt: string;
}

// ─── Junior Advocate Portal ─────────────────────────────────────────────────────

export interface JuniorDashboardMetrics {
  assignedTasks: number;
  pendingTasks: number;
  todayAppearances: number;
  hoursThisWeek: number;
}

export interface JuniorDailyLogEntry {
  id: string;
  date: string;
  tasksCompleted: string[];
  hoursWorked: number;
  courtVisited: boolean;
  issues?: string | null;
  escalate: boolean;
  submittedAt?: string | null;
}

// ─── Client Portal ──────────────────────────────────────────────────────────────

export interface ClientDashboardData {
  activeCases: number;
  upcomingAppointments: number;
  pendingInvoices: number;
  recentDocuments: number;
}

// ─── Finance Portal ─────────────────────────────────────────────────────────────

export interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

/**
 * Frontend-facing model types.
 * Lighter than Prisma-generated types — only fields the UI actually uses.
 */

// ─── Users & Roles ─────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'JUNIOR' | 'INTERN' | 'SENIOR' | 'ADMIN';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  designation?: string | null;
}

export interface JuniorWithStats extends UserSummary {
  createdAt: string;
  caseloadCount: number;
  totalTasks: number;
  pendingTasks: number;
  billableHours: number;
}

// ─── Cases ──────────────────────────────────────────────────────────────────────

export type CaseStatusType = 'INTAKE' | 'ACTIVE' | 'ARGUED' | 'JUDGMENT' | 'CLOSED';

export interface CaseListItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: CaseStatusType;
  nextHearing: string | null;
  court: string;
  createdAt: string;
  client: { id: string; name: string; email: string; phone?: string | null };
  junior?: { id: string; name: string } | null;
}

export interface CaseDetail extends CaseListItem {
  seniorId?: string | null;
  events: CaseEvent[];
  documents: DocumentItem[];
  tasks: TaskListItem[];
}

export interface CaseEvent {
  id: string;
  eventDate: string;
  title: string;
  notes?: string | null;
}

// ─── Tasks ──────────────────────────────────────────────────────────────────────

export type TaskStatusType = 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'URGENT' | 'NORMAL' | 'LOW';
export type TaskType = 'DRAFT' | 'RESEARCH' | 'FILING' | 'COURT' | 'CLIENT_CALL' | 'TRAVEL';

export interface TaskListItem {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  billableHours: number;
  case?: { caseNumber: string; title: string };
  junior?: { name: string };
}

// ─── Documents ──────────────────────────────────────────────────────────────────

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  uploadedBy?: { name: string };
}

// ─── Finance ────────────────────────────────────────────────────────────────────

export type InvoiceStatusType = 'PAID' | 'UNPAID' | 'OVERDUE';

export interface InvoiceItem {
  id: string;
  amount: number;
  gstNumber?: string | null;
  status: InvoiceStatusType;
  pdfUrl?: string | null;
  createdAt: string;
  dueDate?: string | null;
  client: { id: string; name: string; email: string };
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
}

export interface LedgerEntry {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  category: string;
  date: string;
  referenceId?: string | null;
  description?: string | null;
}

// ─── Appointments ───────────────────────────────────────────────────────────────

export type AppointmentStatusType = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface AppointmentItem {
  id: string;
  date: string;
  timeSlot: string;
  caseType: string;
  status: AppointmentStatusType;
  feePaid: number;
  notes?: string | null;
  client: UserSummary;
}

// ─── Drafts ─────────────────────────────────────────────────────────────────────

export type DraftStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'FILED' | 'REDO';
export type DraftType = 'PETITION' | 'AFFIDAVIT' | 'NOTICE' | 'WRITTEN_STATEMENT' | 'VAKALATNAMA';

export interface DraftItem {
  id: string;
  title: string;
  type: DraftType;
  status: DraftStatus;
  version: number;
  fileUrl: string;
  comments?: string | null;
  createdAt: string;
  case: { caseNumber: string; title: string };
  junior: { name: string };
}

// ─── Reminders ──────────────────────────────────────────────────────────────────

export type ReminderStatusType = 'PENDING' | 'SENT' | 'FAILED';

export interface ReminderItem {
  id: string;
  channel: string;
  message: string;
  sentAt?: string | null;
  status: ReminderStatusType;
  scheduledFor?: string | null;
  case: { caseNumber: string; title: string };
  recipient: { name: string; phone?: string | null };
}

// ─── Testimonials ───────────────────────────────────────────────────────────────

export interface TestimonialItem {
  id: string;
  rating: number;
  body: string;
  caseType: string;
  verified: boolean;
  createdAt: string;
  client: { name: string };
}

// ─── Time Tracking ──────────────────────────────────────────────────────────────

export interface TimeLogItem {
  id: string;
  category: string;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  description?: string | null;
  approved: boolean;
  task: { id: string; title: string };
}

// ─── Escalations ────────────────────────────────────────────────────────────────

export type EscalationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface EscalationItem {
  id: string;
  reason: string;
  description: string;
  status: EscalationStatus;
  createdAt: string;
  resolvedAt?: string | null;
  case: { caseNumber: string; title: string };
  junior: { name: string };
}

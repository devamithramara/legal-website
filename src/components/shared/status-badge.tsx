'use client';

import React from 'react';

/**
 * Status badge component for cases, tasks, drafts, invoices, etc.
 *
 * Usage:
 *   <StatusBadge status="ACTIVE" />
 *   <StatusBadge status="OVERDUE" variant="finance" />
 */

type BadgeVariant = 'case' | 'task' | 'draft' | 'finance' | 'reminder' | 'escalation' | 'default';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const COLOR_MAP: Record<string, string> = {
  // Case statuses
  INTAKE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ARGUED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  JUDGMENT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CLOSED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',

  // Task statuses
  ASSIGNED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  REVIEW: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  TODO: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DONE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',

  // Draft statuses
  DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  UNDER_REVIEW: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  APPROVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  FILED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  REDO: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Finance
  PAID: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  UNPAID: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Reminders
  PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  SENT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  FAILED: 'bg-red-500/20 text-red-300 border-red-500/30',

  // Escalations
  OPEN: 'bg-red-500/20 text-red-300 border-red-500/30',
  ACKNOWLEDGED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',

  // Priority
  URGENT: 'bg-red-500/20 text-red-300 border-red-500/30',
  NORMAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',

  // Appointment
  CONFIRMED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const DEFAULT_COLOR = 'bg-gray-500/20 text-gray-400 border-gray-500/30';

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = COLOR_MAP[status] || DEFAULT_COLOR;
  const displayText = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {displayText}
    </span>
  );
}

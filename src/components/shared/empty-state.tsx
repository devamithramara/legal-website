'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Empty state component for lists and tables with no data.
 *
 * Usage:
 *   <EmptyState title="No cases found" description="Create your first case" />
 *   <EmptyState title="No tasks" icon={CheckCircle} action={{ label: 'Add Task', onClick: fn }} />
 */

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="p-4 bg-gray-800/60 rounded-full mb-4">
        <Icon className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

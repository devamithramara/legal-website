'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

/**
 * Reusable stat/metric card for dashboard pages.
 *
 * Usage:
 *   <StatCard title="Active Cases" value={42} icon={Scale} trend="+5%" />
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = 'neutral',
  className = '',
}: StatCardProps) {
  const trendColor =
    trendDirection === 'up'
      ? 'text-emerald-400'
      : trendDirection === 'down'
        ? 'text-red-400'
        : 'text-gray-400';

  return (
    <Card className={`bg-gray-800/60 border-gray-700/50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>
            )}
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <Icon className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';

/**
 * Loading skeleton component for content placeholders.
 *
 * Usage:
 *   <LoadingSkeleton />                          // single line
 *   <LoadingSkeleton lines={3} />                // 3 lines
 *   <LoadingSkeleton variant="card" count={4} /> // 4 card skeletons
 */

interface LoadingSkeletonProps {
  variant?: 'line' | 'card' | 'table';
  lines?: number;
  count?: number;
  className?: string;
}

function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 bg-gray-700/50 rounded animate-pulse"
      style={{ width }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-6 space-y-3">
      <SkeletonLine width="40%" />
      <SkeletonLine width="60%" />
      <SkeletonLine width="80%" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-700/30">
      <SkeletonLine width="15%" />
      <SkeletonLine width="30%" />
      <SkeletonLine width="20%" />
      <SkeletonLine width="15%" />
      <SkeletonLine width="10%" />
    </div>
  );
}

export function LoadingSkeleton({
  variant = 'line',
  lines = 1,
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-0 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </div>
    );
  }

  const widths = ['100%', '90%', '75%', '85%', '60%'];
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

/**
 * Full-page loading state for portal dashboards.
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

'use client';

import { useApi } from './use-api';
import type { AdminDashboardMetrics, SeniorDashboardMetrics, JuniorDashboardMetrics } from '@/types/portals';

/**
 * Dashboard data hooks — one per portal.
 *
 * Usage:
 *   const { metrics, loading } = useAdminDashboard();
 *   const { metrics, loading } = useSeniorDashboard();
 *   const { metrics, loading } = useJuniorDashboard();
 */

export function useAdminDashboard() {
  const { data, loading, error, refetch } = useApi<AdminDashboardMetrics>('/api/admin/dashboard');
  return { metrics: data, loading, error, refetch };
}

export function useSeniorDashboard() {
  const { data, loading, error, refetch } = useApi<SeniorDashboardMetrics>('/api/senior/analytics');
  return { metrics: data, loading, error, refetch };
}

export function useJuniorDashboard() {
  const { data, loading, error, refetch } = useApi<JuniorDashboardMetrics>('/api/tasks');
  return { metrics: data, loading, error, refetch };
}

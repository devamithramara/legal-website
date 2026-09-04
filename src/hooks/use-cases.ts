'use client';

import { useApi } from './use-api';
import type { CaseListItem } from '@/types/models';

/**
 * Hook for fetching the case list.
 * The API already filters by role server-side.
 *
 * Usage:
 *   const { cases, loading, error, refetch } = useCases();
 */
export function useCases() {
  const { data, loading, error, refetch } = useApi<CaseListItem[]>('/api/cases');
  return { cases: data ?? [], loading, error, refetch };
}

/**
 * Hook for fetching a single case by ID.
 *
 * Usage:
 *   const { caseData, loading } = useCase(id);
 */
export function useCase(id: string | null) {
  const { data, loading, error, refetch } = useApi<CaseListItem>(
    id ? `/api/cases/${id}` : null,
  );
  return { caseData: data, loading, error, refetch };
}

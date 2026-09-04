'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiState } from '@/types/api';

/**
 * Generic data-fetching hook with loading, error, and refetch support.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi<Case[]>('/api/cases');
 *   const { data, loading } = useApi<Metrics>('/api/admin/dashboard');
 */
export function useApi<T>(url: string | null, options?: RequestInit): ApiState<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for POST/PUT/DELETE mutations with optimistic state.
 *
 * Usage:
 *   const { mutate, loading } = useMutation<Task>('/api/tasks');
 *   await mutate({ title: 'New task', caseId: '...' });
 */
export function useMutation<T>(url: string, method = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body?: unknown): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(data.error || `Request failed: ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Mutation failed';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method],
  );

  return { mutate, loading, error };
}

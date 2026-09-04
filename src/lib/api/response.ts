import { NextResponse } from 'next/server';
import { ApiError } from './auth-guard';

/**
 * Standardized API response helpers.
 *
 * Usage:
 *   return success(data);
 *   return success(data, 201);
 *   return error('Not found', 404);
 *   return paginated(items, total, page, perPage);
 *   return handleApiError(err);
 */

/** Success response with optional status and cache headers. */
export function success<T>(data: T, status = 200, cache = false) {
  const headers: Record<string, string> = {};
  if (cache) {
    headers['Cache-Control'] = 'private, max-age=2, stale-while-revalidate=5';
  }
  return NextResponse.json(data, { status, headers });
}

/** Error response with message and status code. */
export function error(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** Paginated response wrapper. */
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
) {
  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

/**
 * Catch-all error handler for API routes.
 * Handles ApiError (known) and unknown errors gracefully.
 *
 * Usage in route handlers:
 *   try { ... } catch (err) { return handleApiError(err); }
 */
export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return error(err.message, err.statusCode);
  }
  console.error('[API Error]', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return error(message, 500);
}

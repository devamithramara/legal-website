import { ApiError } from './auth-guard';

/**
 * Request body & parameter validation helpers.
 *
 * Usage:
 *   const { title, amount } = requireFields(body, ['title', 'amount']);
 *   const id = parseId(params.id);
 */

/**
 * Validate that required fields exist in the request body.
 * Throws ApiError(400) listing all missing fields.
 */
export function requireFields<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[],
): T {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === '',
  );
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }
  return body;
}

/** UUID v4 regex pattern */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate and return a UUID string.
 * Throws ApiError(400) if the format is invalid.
 */
export function parseId(value: string | undefined | null, label = 'ID'): string {
  if (!value) {
    throw new ApiError(400, `${label} is required`);
  }
  if (!UUID_RE.test(value)) {
    throw new ApiError(400, `Invalid ${label} format`);
  }
  return value;
}

/**
 * Parse a numeric value from string, with optional bounds.
 * Throws ApiError(400) if parsing fails or value is out of bounds.
 */
export function parseNumber(
  value: string | undefined | null,
  label = 'value',
  opts?: { min?: number; max?: number },
): number {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `${label} is required`);
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new ApiError(400, `${label} must be a number`);
  }
  if (opts?.min !== undefined && num < opts.min) {
    throw new ApiError(400, `${label} must be at least ${opts.min}`);
  }
  if (opts?.max !== undefined && num > opts.max) {
    throw new ApiError(400, `${label} must be at most ${opts.max}`);
  }
  return num;
}

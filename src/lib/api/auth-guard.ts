import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

/**
 * Shared API authentication guards.
 *
 * Usage:
 *   const session = await requireAuth();          // 401 if not logged in
 *   const session = await requireRole('ADMIN');   // 403 if wrong role
 *   const session = await requireAdmin();         // shorthand
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Require an authenticated session. Throws ApiError(401) if not logged in. */
export async function requireAuth(): Promise<Session & { user: { id: string; role: Role } }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  return session as Session & { user: { id: string; role: Role } };
}

/** Require the user to have a specific role. Throws ApiError(403) if mismatched. */
export async function requireRole(
  ...roles: Role[]
): Promise<Session & { user: { id: string; role: Role } }> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new ApiError(403, `Forbidden. Required role: ${roles.join(' | ')}`);
  }
  return session;
}

/** Convenience: require ADMIN role. */
export async function requireAdmin() {
  return requireRole(Role.ADMIN);
}

/** Convenience: require SENIOR or ADMIN role. */
export async function requireSenior() {
  return requireRole(Role.SENIOR, Role.ADMIN);
}

/** Convenience: require JUNIOR, INTERN, or ADMIN role. */
export async function requireJunior() {
  return requireRole(Role.JUNIOR, Role.INTERN, Role.ADMIN);
}

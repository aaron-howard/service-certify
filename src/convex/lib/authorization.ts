import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { UserIdentity } from 'convex/server';
import { workosUserIdFromIdentity } from './workosIdentity';

export type UserRole = 'user' | 'admin';

/** Max questions returned for anonymous sample practice. */
export const SAMPLE_QUESTION_LIMIT = 3;

export type PracticeMode = 'sample' | 'full';

export function resolveUserRole(role: UserRole | undefined): UserRole {
	return role ?? 'user';
}

export function isAdminUser(user: Pick<Doc<'users'>, 'role'>): boolean {
	return resolveUserRole(user.role) === 'admin';
}

/**
 * Authorize only by WorkOS subject from the JWT.
 * Do not look up users by email — Convex has no unique constraint on `by_email`,
 * so a token whose email matches another row (including admin) could bind to
 * that account (CSO finding 3).
 */
export async function lookupUserForIdentity(
	identity: UserIdentity,
	findByWorkosId: (workosId: string) => Promise<Doc<'users'> | null>
): Promise<Doc<'users'> | null> {
	const workosId = workosUserIdFromIdentity(identity);
	if (!workosId) return null;
	return findByWorkosId(workosId);
}

export async function getAuthenticatedUser(
	ctx: QueryCtx | MutationCtx
): Promise<Doc<'users'> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;

	return lookupUserForIdentity(identity, (workosId) =>
		ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', workosId))
			.unique()
	);
}

export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Doc<'users'>> {
	const user = await getAuthenticatedUser(ctx);
	if (!user) {
		throw new Error('Not authenticated');
	}
	return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<Doc<'users'>> {
	const user = await requireUser(ctx);
	if (!isAdminUser(user)) {
		throw new Error('Admin access required');
	}
	return user;
}

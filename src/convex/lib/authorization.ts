import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export type UserRole = 'user' | 'admin';

/** Max questions returned for anonymous sample practice. */
export const SAMPLE_QUESTION_LIMIT = 3;

export type PracticeMode = 'sample' | 'full';

/** Check whether an email is in the ADMIN_EMAILS Convex env allowlist. */
export function isAdminEmail(email: string): boolean {
	const raw = process.env.ADMIN_EMAILS ?? '';
	const allowlist = raw
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	return allowlist.includes(email.trim().toLowerCase());
}

export function resolveUserRole(role: UserRole | undefined): UserRole {
	return role ?? 'user';
}

export function isAdminUser(user: Pick<Doc<'users'>, 'role'>): boolean {
	return resolveUserRole(user.role) === 'admin';
}

export async function getAuthenticatedUser(
	ctx: QueryCtx | MutationCtx
): Promise<Doc<'users'> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;

	return await ctx.db
		.query('users')
		.withIndex('by_workosId', (q) => q.eq('workosId', identity.subject))
		.unique();
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

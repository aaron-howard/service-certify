import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { isAdminEmail } from './adminEmails';
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

export async function getAuthenticatedUser(
	ctx: QueryCtx | MutationCtx
): Promise<Doc<'users'> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;

	const workosId = workosUserIdFromIdentity(identity);
	let user: Doc<'users'> | null = null;

	if (workosId) {
		user = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', workosId))
			.unique();
	}

	if (!user && identity.email) {
		user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', identity.email!))
			.unique();
	}

	return user;
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

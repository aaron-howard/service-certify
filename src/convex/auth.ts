import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { isAdminEmail } from './lib/adminEmails';
import { resolveUserRole, getAuthenticatedUser } from './lib/authorization';
import {
	DELETE_ACCOUNT_MAX_AGE_SECONDS,
	authTimeSecondsFromIdentity,
	isAuthTimeFresh
} from './lib/authFreshness';
import { canonicalAuthEmail, workosUserIdFromIdentity } from './lib/workosIdentity';

type UserProfilePatch = {
	email: string;
	name?: string;
	profileImage?: string;
	provider?: string;
	role?: 'admin' | 'user';
};

/**
 * Get or create user from WorkOS identity.
 * Requires a valid WorkOS JWT (`setAuth`); identity.subject must match workosId.
 * Called after successful OAuth callback and on session refresh.
 */
export const createOrUpdateUser = mutation({
	args: {
		workosId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		profileImage: v.optional(v.string()),
		provider: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		const identityWorkosId = workosUserIdFromIdentity(identity);
		if (!identityWorkosId || identityWorkosId !== args.workosId) {
			throw new Error('workosId does not match authenticated identity');
		}

		const email = canonicalAuthEmail(identity, args.email);
		if (!args.workosId || !email) {
			throw new Error('Missing required fields: workosId, email');
		}

		const existing = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', args.workosId))
			.unique();

		if (existing) {
			const patch: UserProfilePatch = {
				email,
				name: args.name,
				profileImage: args.profileImage,
				provider: args.provider,
				// Re-evaluate on every sync so removed allowlist emails lose admin.
				role: isAdminEmail(email) ? 'admin' : 'user'
			};

			await ctx.db.patch(existing._id, patch);
			const updated = await ctx.db.get(existing._id);
			const role = resolveUserRole(updated?.role ?? existing.role);
			return {
				userId: existing._id,
				role,
				name: updated?.name ?? args.name,
				profileImage: updated?.profileImage ?? args.profileImage,
				provider: updated?.provider ?? args.provider
			};
		}

		const role = isAdminEmail(email) ? 'admin' : 'user';
		const userId = await ctx.db.insert('users', {
			workosId: args.workosId,
			email,
			name: args.name,
			profileImage: args.profileImage,
			provider: args.provider,
			role,
			createdAt: Date.now()
		});

		return {
			userId,
			role,
			name: args.name,
			profileImage: args.profileImage,
			provider: args.provider
		};
	}
});

/**
 * Get current authenticated user.
 * Uses WorkOS subject from JWT token.
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx);
		if (!user) return null;

		const role = resolveUserRole(user.role);
		return { ...user, role, isAdmin: role === 'admin' };
	}
});

/**
 * Get the authenticated user's own profile by email.
 * Requires JWT; only returns a row when email matches the signed-in identity.
 */
export const getUserByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}
		if (!identity.email || identity.email.toLowerCase() !== args.email.toLowerCase()) {
			throw new Error('Cannot look up another user');
		}

		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.unique();

		if (!user) return null;

		const role = resolveUserRole(user.role);
		return { ...user, role, isAdmin: role === 'admin' };
	}
});

/**
 * Delete user account and all associated data.
 * Requires authentication.
 */
export const deleteAccount = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		const nowSeconds = Date.now() / 1000;
		if (
			!isAuthTimeFresh(
				authTimeSecondsFromIdentity(identity),
				nowSeconds,
				DELETE_ACCOUNT_MAX_AGE_SECONDS
			)
		) {
			throw new Error('Recent re-authentication required');
		}

		const user = await getAuthenticatedUser(ctx);
		if (!user) {
			throw new Error('Not authenticated');
		}

		const progress = await ctx.db
			.query('userProgress')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.collect();

		for (const p of progress) {
			await ctx.db.delete(p._id);
		}

		await ctx.db.delete(user._id);

		return true;
	}
});

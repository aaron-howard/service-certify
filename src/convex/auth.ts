import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { isAdminEmail, isAdminUser, resolveUserRole } from './lib/authorization';

/**
 * Get or create user from WorkOS identity.
 * Called after successful OAuth callback.
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
		if (!args.workosId || !args.email) {
			throw new Error('Missing required fields: workosId, email');
		}

		const existing = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', args.workosId))
			.unique();

		if (existing) {
			const patch: {
				email: string;
				name?: string;
				profileImage?: string;
				provider?: string;
				role?: 'admin';
			} = {
				email: args.email,
				name: args.name,
				profileImage: args.profileImage,
				provider: args.provider
			};

			// Promote allowlisted emails; never downgrade admins on profile sync.
			if (!isAdminUser(existing) && isAdminEmail(args.email)) {
				patch.role = 'admin';
			}

			await ctx.db.patch(existing._id, patch);
			return existing._id;
		}

		const role = isAdminEmail(args.email) ? 'admin' : 'user';
		const userId = await ctx.db.insert('users', {
			workosId: args.workosId,
			email: args.email,
			name: args.name,
			profileImage: args.profileImage,
			provider: args.provider,
			role,
			createdAt: Date.now()
		});

		return userId;
	}
});

/**
 * Get current authenticated user.
 * Uses WorkOS subject from JWT token.
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const user = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', identity.subject))
			.unique();

		if (!user) return null;

		const role = resolveUserRole(user.role);
		return { ...user, role, isAdmin: role === 'admin' };
	}
});

/**
 * Get user by email.
 */
export const getUserByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
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

		const user = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', identity.subject))
			.unique();

		if (!user) {
			throw new Error('User not found');
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

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';

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
		// Validate input
		if (!args.workosId || !args.email) {
			throw new Error('Missing required fields: workosId, email');
		}

		// Check if user exists
		const existing = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', args.workosId))
			.unique();

		if (existing) {
			// Update existing user
			await ctx.db.patch(existing._id, {
				email: args.email,
				name: args.name,
				profileImage: args.profileImage,
				provider: args.provider
			});
			return existing._id;
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			workosId: args.workosId,
			email: args.email,
			name: args.name,
			profileImage: args.profileImage,
			provider: args.provider,
			createdAt: Date.now()
		});

		return userId;
	}
});

/**
 * Get current authenticated user.
 * Uses tokenIdentifier from JWT token.
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// Get user by WorkOS ID (stored in token identifier)
		const user = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', identity.subject))
			.unique();

		return user;
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

		return user;
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

		// Get user
		const user = await ctx.db
			.query('users')
			.withIndex('by_workosId', (q) => q.eq('workosId', identity.subject))
			.unique();

		if (!user) {
			throw new Error('User not found');
		}

		// Delete user progress
		const progress = await ctx.db
			.query('userProgress')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.collect();

		for (const p of progress) {
			await ctx.db.delete(p._id);
		}

		// Delete user
		await ctx.db.delete(user._id);

		return true;
	}
});

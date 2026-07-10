import { mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';
import { getAuthenticatedUser, requireUser } from './lib/authorization';

/**
 * Upsert practice progress for a user after a graded session.
 * Score is a percentage 0–100.
 */
export async function recordPracticeSession(
	ctx: MutationCtx,
	args: {
		userId: Id<'users'>;
		trackCode: string;
		scorePercent: number;
	}
) {
	const score = Math.max(0, Math.min(100, Math.round(args.scorePercent)));
	const now = Date.now();

	const existing = await ctx.db
		.query('userProgress')
		.withIndex('by_userId_and_trackCode', (q) =>
			q.eq('userId', args.userId).eq('trackCode', args.trackCode)
		)
		.unique();

	if (!existing) {
		await ctx.db.insert('userProgress', {
			userId: args.userId,
			trackCode: args.trackCode,
			sessionsCompleted: 1,
			bestScore: score,
			averageScore: score,
			lastAttemptedAt: now
		});
		return;
	}

	const sessionsCompleted = existing.sessionsCompleted + 1;
	const averageScore = Math.round(
		(existing.averageScore * existing.sessionsCompleted + score) / sessionsCompleted
	);

	await ctx.db.patch(existing._id, {
		sessionsCompleted,
		bestScore: Math.max(existing.bestScore, score),
		averageScore,
		lastAttemptedAt: now
	});
}

/** List progress rows for the signed-in user (newest activity first). */
export const listForCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthenticatedUser(ctx);
		if (!user) return [];

		const rows = await ctx.db
			.query('userProgress')
			.withIndex('by_userId', (q) => q.eq('userId', user._id))
			.collect();

		return rows
			.map((row) => ({
				trackCode: row.trackCode,
				sessionsCompleted: row.sessionsCompleted,
				bestScore: row.bestScore,
				averageScore: row.averageScore,
				lastAttemptedAt: row.lastAttemptedAt
			}))
			.sort((a, b) => b.lastAttemptedAt - a.lastAttemptedAt);
	}
});

/**
 * Record a practice session for the current user.
 * Prefer calling from gradeAnswers; exposed for authenticated clients if needed.
 */
export const recordSession = mutation({
	args: {
		trackCode: v.string(),
		scorePercent: v.number()
	},
	handler: async (ctx, args) => {
		if (!args.trackCode || args.trackCode.length < 3 || args.trackCode.length > 10) {
			throw new Error('Invalid trackCode: must be 3-10 characters');
		}
		const user = await requireUser(ctx);
		await recordPracticeSession(ctx, {
			userId: user._id,
			trackCode: args.trackCode,
			scorePercent: args.scorePercent
		});
		return true;
	}
});

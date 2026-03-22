import { query } from './_generated/server';
import { v } from 'convex/values';

export const listByTrackCode = query({
	args: { trackCode: v.string() },
	handler: async (ctx, { trackCode }) => {
		const rows = await ctx.db
			.query('practiceQuestions')
			.withIndex('by_trackCode', (q) => q.eq('trackCode', trackCode))
			.collect();
		return rows.sort((a, b) => a.order - b.order);
	}
});

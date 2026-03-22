import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	certificationTracks: defineTable({
		code: v.string(),
		officialName: v.string(),
		sortOrder: v.number()
	}).index('by_code', ['code']),

	practiceQuestions: defineTable({
		trackCode: v.string(),
		order: v.number(),
		prompt: v.string(),
		choices: v.array(v.string()),
		correctIndex: v.number(),
		explanation: v.string(),
		sourceUrls: v.array(v.string()),
		difficulty: v.optional(v.literal('dev'))
	}).index('by_trackCode', ['trackCode'])
});

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	certificationTracks: defineTable({
		// Track code (e.g., "CAD", "CIS") — expected 3-10 chars
		code: v.string(),
		// Official name (e.g., "Certified Application Developer") — expected 5-200 chars
		officialName: v.string(),
		// Sort order for display — expected 0-1000
		sortOrder: v.number()
	}).index('by_code', ['code']),

	practiceQuestions: defineTable({
		// Reference to certification track code — expected 3-10 chars
		trackCode: v.string(),
		// Question order within track — expected 0-10000
		order: v.number(),
		// Question text — expected 10-2000 chars
		prompt: v.string(),
		// Multiple choice options — expected 2-6 choices, 5-500 chars each
		choices: v.array(v.string()),
		// Correct answer index — must be valid for choices array (0-5)
		correctIndex: v.number(),
		// Explanation — expected 20-3000 chars
		explanation: v.string(),
		// Reference URLs for learning — expected 0-10 URLs, 10-500 chars each
		sourceUrls: v.array(v.string()),
		// Question difficulty level (currently only 'dev' for development)
		difficulty: v.optional(v.literal('dev'))
	}).index('by_trackCode', ['trackCode'])
});

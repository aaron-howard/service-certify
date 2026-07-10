import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		// WorkOS user ID (unique, immutable)
		workosId: v.string(),
		// User email from WorkOS
		email: v.string(),
		// User full name from OAuth profile
		name: v.optional(v.string()),
		// Profile picture URL from OAuth provider
		profileImage: v.optional(v.string()),
		// OAuth provider (google, microsoft, github)
		provider: v.optional(v.string()),
		// Application role (default user; admin unlocks full practice)
		role: v.optional(v.union(v.literal('user'), v.literal('admin'))),
		// Account creation date
		createdAt: v.number()
	})
		.index('by_workosId', ['workosId'])
		.index('by_email', ['email']),

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
		// Multiple choice options — expected 2-6 choices for single/multi; empty for match.
		choices: v.array(v.string()),
		// Correct answer index — must be valid for choices array (0-5).
		// For multi-select questions this holds the first correct index (back-compat).
		// For match questions this is 0 (sentinel).
		correctIndex: v.number(),
		// Question format: 'single' (default), 'multi' (select all), or 'match' (drag/drop pairs)
		questionType: v.optional(
			v.union(v.literal('single'), v.literal('multi'), v.literal('match'))
		),
		// For multi-select: full set of correct choice indexes (sorted). Absent for single.
		correctIndexes: v.optional(v.array(v.number())),
		// For match: left (draggable) and right (target) item labels.
		matchLeftItems: v.optional(v.array(v.string())),
		matchRightItems: v.optional(v.array(v.string())),
		// For match: correct pairings by left/right index (each left maps to one right).
		correctMatches: v.optional(
			v.array(
				v.object({
					left: v.number(),
					right: v.number()
				})
			)
		),
		// Explanation — expected 20-3000 chars
		explanation: v.string(),
		// Reference URLs for learning — expected 0-10 URLs, 10-500 chars each
		sourceUrls: v.array(v.string()),
		// Question difficulty level (currently only 'dev' for development)
		difficulty: v.optional(v.literal('dev'))
	}).index('by_trackCode', ['trackCode']),

	userProgress: defineTable({
		// Reference to user
		userId: v.id('users'),
		// Certification track code
		trackCode: v.string(),
		// Total practice sessions completed
		sessionsCompleted: v.number(),
		// Best score percentage
		bestScore: v.number(),
		// Average score percentage
		averageScore: v.number(),
		// Last attempted date
		lastAttemptedAt: v.number()
	})
		.index('by_userId', ['userId'])
		.index('by_userId_and_trackCode', ['userId', 'trackCode'])
});

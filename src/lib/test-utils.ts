/**
 * Common test utilities and helpers for Service Certify tests.
 */

/** Mock Convex context for testing mutations/queries */
export interface MockConvexContext {
	db: {
		query: (table: string) => MockQuery;
		get: (table: string, id: string) => Promise<unknown>;
	};
	auth: {
		getUserIdentity: () => Promise<{ subject: string } | null>;
	};
}

interface MockQuery {
	withIndex: (index: string, fn: (q: any) => any) => MockQuery;
	collect: () => Promise<any[]>;
	unique: () => Promise<any>;
	eq: (field: string, value: unknown) => MockQuery;
}

/**
 * Create a mock Convex context for testing.
 * Override methods as needed for your tests.
 */
export function createMockConvexContext(): MockConvexContext {
	const mockQuery: MockQuery = {
		withIndex: () => mockQuery,
		collect: async () => [],
		unique: async () => undefined,
		eq: () => mockQuery
	};

	return {
		db: {
			query: () => mockQuery,
			get: async () => undefined
		},
		auth: {
			getUserIdentity: async () => null
		}
	};
}

/**
 * Create mock practice questions for testing.
 */
export function createMockQuestion(overrides = {}) {
	return {
		_id: 'q1',
		_creationTime: Date.now(),
		trackCode: 'CAD',
		order: 0,
		prompt: 'What is the correct answer?',
		choices: ['Option A', 'Option B', 'Option C', 'Option D'],
		correctIndex: 1,
		explanation: 'Option B is correct because...',
		sourceUrls: ['https://example.com/docs'],
		...overrides
	};
}

/**
 * Create mock certification track for testing.
 */
export function createMockTrack(overrides = {}) {
	return {
		_id: 'track-1',
		_creationTime: Date.now(),
		code: 'CAD',
		officialName: 'Certified Application Developer',
		sortOrder: 0,
		...overrides
	};
}

/**
 * Create mock practice answers for testing.
 */
export function createMockAnswer(overrides = {}) {
	return {
		order: 0,
		selectedIndex: 1,
		...overrides
	};
}

/**
 * Validate that a value is within a range.
 */
export function isInRange(value: number, min: number, max: number): boolean {
	return value >= min && value <= max;
}

/**
 * Generate random practice answers.
 */
export function generateRandomAnswers(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		order: i,
		selectedIndex: Math.floor(Math.random() * 6)
	}));
}

/**
 * Calculate grade percentage.
 */
export function calculateGradePercentage(correct: number, total: number): number {
	if (total === 0) return 0;
	return (correct / total) * 100;
}

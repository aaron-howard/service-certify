/**
 * Common test utilities and helpers for Service Certify tests.
 */

/**
 * Create mock practice questions for testing.
 */
export function createMockQuestion(overrides: Record<string, string | number | string[]> = {}) {
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
export function createMockTrack(overrides: Record<string, string | number> = {}) {
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
 * Create mock practice answer for testing.
 */
export function createMockAnswer(overrides: { order?: number; selectedIndex?: number } = {}) {
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

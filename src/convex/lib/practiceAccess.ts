import { SAMPLE_QUESTION_LIMIT, type PracticeMode } from './authorization';

type OrderedQuestion = { order: number };

export type PracticeModeLimitOptions = {
	/** Questions served per attempt (official exam length for full mocks). */
	attemptQuestionCount?: number;
	/** Stable per-attempt seed so list and grade use the same random subset. */
	sessionSeed?: string;
};

function hashString(seed: string): number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
	}
	return hash >>> 0;
}

/** Deterministic shuffle for reproducible mock attempts within a session. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
	const copy = [...items];
	let state = hashString(seed) || 1;
	for (let i = copy.length - 1; i > 0; i--) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const j = state % (i + 1);
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/** Limit or sample questions based on practice mode. */
export function applyModeLimit<T extends OrderedQuestion>(
	questions: T[],
	mode: PracticeMode,
	options: PracticeModeLimitOptions = {}
): T[] {
	const sorted = [...questions].sort((a, b) => a.order - b.order);
	if (mode === 'sample') {
		return sorted.slice(0, SAMPLE_QUESTION_LIMIT);
	}

	const attemptCount = options.attemptQuestionCount ?? sorted.length;
	if (attemptCount >= sorted.length) {
		return sorted;
	}

	const seed = options.sessionSeed ?? 'full-mock-default';
	const picked = seededShuffle(sorted, seed).slice(0, attemptCount);
	return picked.sort((a, b) => a.order - b.order);
}

/** Ensure submitted answers only reference orders allowed for the session mode. */
export function validateAnswersForMode(
	answers: { order: number }[],
	allowedOrders: Set<number>
): void {
	for (const answer of answers) {
		if (!allowedOrders.has(answer.order)) {
			throw new Error(`Question order ${answer.order} is not available in this practice mode`);
		}
	}
}

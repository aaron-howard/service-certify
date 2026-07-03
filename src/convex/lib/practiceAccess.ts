import { SAMPLE_QUESTION_LIMIT, type PracticeMode } from './authorization';

type OrderedQuestion = { order: number };

/** Limit questions based on practice mode. */
export function applyModeLimit<T extends OrderedQuestion>(
	questions: T[],
	mode: PracticeMode
): T[] {
	const sorted = [...questions].sort((a, b) => a.order - b.order);
	if (mode === 'sample') {
		return sorted.slice(0, SAMPLE_QUESTION_LIMIT);
	}
	return sorted;
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

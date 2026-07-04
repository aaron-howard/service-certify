import type { MatchPair, QuestionType } from '../../lib/catalog/questionTypes';

/** Row shape for `practiceQuestions` dev seed (checked into repo). */
export type { MatchPair, QuestionType } from '../../lib/catalog/questionTypes';

export type DevPracticeQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	/** Required for single/multi; empty array for match. */
	choices: [string, string, string, string] | string[];
	/**
	 * Correct answer index. For single-answer questions this is the only key.
	 * For multi-select questions this equals the first entry of `correctIndexes`.
	 * For match questions this is 0 (sentinel).
	 */
	correctIndex: number;
	/** Question format. Absent implies `'single'`. */
	questionType?: QuestionType;
	/** Full set of correct indexes for `'multi'` questions (sorted ascending). */
	correctIndexes?: number[];
	/** Drag/drop left-column items for `'match'` questions. */
	matchLeftItems?: string[];
	/** Drop-target labels for `'match'` questions. */
	matchRightItems?: string[];
	/** Correct left→right pairings for `'match'` questions. */
	correctMatches?: MatchPair[];
	explanation: string;
	sourceUrls: string[];
};

/** Row shape for `practiceQuestions` dev seed (checked into repo). */
export type DevPracticeQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: [string, string, string, string];
	/**
	 * Correct answer index. For single-answer questions this is the only key.
	 * For multi-select questions this equals the first entry of `correctIndexes`
	 * so back-compatible single-answer code paths still function.
	 */
	correctIndex: number;
	/** Question format. Absent implies `'single'`. */
	questionType?: 'single' | 'multi';
	/** Full set of correct indexes for `'multi'` questions (sorted ascending). */
	correctIndexes?: number[];
	explanation: string;
	sourceUrls: string[];
};

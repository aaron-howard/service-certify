/** Row shape for `practiceQuestions` dev seed (checked into repo). */
export type DevPracticeQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: [string, string, string, string];
	correctIndex: number;
	explanation: string;
	sourceUrls: string[];
};

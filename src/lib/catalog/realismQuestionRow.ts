import type { MatchPair, QuestionType } from './questionTypes';

/** Shared shape accepted by track realism validators and seed tests. */
export type RealismQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: string;
	questionType?: QuestionType;
	correctIndex?: number;
	correctIndexes?: number[];
	matchLeftItems?: string[];
	matchRightItems?: string[];
	correctMatches?: MatchPair[];
	contentDifficulty?: string;
};

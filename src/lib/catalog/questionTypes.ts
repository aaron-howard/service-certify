/** Shared practice question format types. */

export type McQuestionType = 'single' | 'multi';

/** All supported item types including CPOE drag/drop matching. */
export type QuestionType = McQuestionType | 'match';

export type MatchPair = { left: number; right: number };

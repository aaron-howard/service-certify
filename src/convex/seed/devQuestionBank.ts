/**
 * Loader for the practice question bank.
 *
 * The full bank is gitignored (`devQuestionBank.private.ts`) so it is not public.
 * `scripts/ensure-private-question-bank.mjs` copies the stub example into that
 * path when the private file is missing (CI / fresh clones).
 */
import { DEV_PRACTICE_QUESTIONS as loadedBank } from './devQuestionBank.private';
import type { DevPracticeQuestionRow } from './devQuestionBank.types';

export type { DevPracticeQuestionRow };

/** Production/dev full bank is thousands of rows; the committed stub is a handful. */
export const FULL_QUESTION_BANK_MIN_ROWS = 400;

export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = loadedBank;

export function isFullQuestionBank(): boolean {
	return DEV_PRACTICE_QUESTIONS.length >= FULL_QUESTION_BANK_MIN_ROWS;
}

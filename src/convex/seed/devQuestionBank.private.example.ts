// @ts-nocheck — matches the private bank module shape
/**
 * Public stub copied to `devQuestionBank.private.ts` when that file is absent.
 * Not a real exam bank. Place the private bank at
 * `src/convex/seed/devQuestionBank.private.ts` before `npm run seed:dev:questions`.
 */
import type { DevPracticeQuestionRow } from './devQuestionBank.types';

export const DEV_PRACTICE_QUESTIONS =
	// SAFETY: Stub rows for CI/typecheck when the private bank is not present.
	[
		{
			trackCode: 'CAD',
			order: 0,
			prompt: 'Stub question for CI when the private bank is not present. Which option is correct?',
			choices: [
				'This stub is the full production question bank',
				'This stub is only a placeholder so the repo typechecks',
				'This stub should be seeded to production',
				'This stub replaces official exam content'
			],
			correctIndex: 1,
			explanation:
				'The full practice bank is gitignored. Copy the private file into place before seeding.',
			sourceUrls: ['https://github.com/aaron-howard/service-certify'],
			domain: 'Designing and Creating an Application'
		}
	] as unknown as DevPracticeQuestionRow[];

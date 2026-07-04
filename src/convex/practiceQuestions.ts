import { mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/authorization';
import { applyModeLimit, validateAnswersForMode } from './lib/practiceAccess';
import { getOfficialQuestionCount } from './catalog/examQuestionPolicy';

const practiceModeValidator = v.union(v.literal('sample'), v.literal('full'));

const matchPairValidator = v.object({
	left: v.number(),
	right: v.number()
});

const answerValidator = v.object({
	order: v.number(),
	// Single-answer selection (also used as first selection for multi).
	selectedIndex: v.number(),
	// Multi-select: full set of selected indexes. Absent for single-answer.
	selectedIndexes: v.optional(v.array(v.number())),
	// Match: user pairings (left index → right index).
	matchAnswers: v.optional(v.array(matchPairValidator))
});

/** True when two index lists contain exactly the same values (order-independent). */
function sameIndexSet(a: number[], b: number[]): boolean {
	if (a.length !== b.length) return false;
	const setB = new Set(b);
	return a.every((n) => setB.has(n));
}

type MatchPair = { left: number; right: number };

/** True when match pair sets are identical (order-independent). */
function sameMatchPairs(a: MatchPair[], b: MatchPair[]): boolean {
	if (a.length !== b.length) return false;
	const key = (p: MatchPair) => `${p.left}:${p.right}`;
	const setB = new Set(b.map(key));
	return a.every((p) => setB.has(key(p)));
}

async function loadQuestionsForTrack(ctx: QueryCtx, trackCode: string) {
	return await ctx.db
		.query('practiceQuestions')
		.withIndex('by_trackCode', (q) => q.eq('trackCode', trackCode))
		.collect();
}

function limitQuestionsForSession(
	rows: Awaited<ReturnType<typeof loadQuestionsForTrack>>,
	mode: 'sample' | 'full',
	trackCode: string,
	sessionSeed?: string
) {
	const attemptQuestionCount = mode === 'full' ? getOfficialQuestionCount(trackCode) : undefined;
	return applyModeLimit(rows, mode, {
		attemptQuestionCount,
		sessionSeed
	});
}

function mapQuestionRows(rows: Awaited<ReturnType<typeof loadQuestionsForTrack>>) {
	return rows.map((row) => ({
		order: row.order,
		prompt: row.prompt,
		choices: row.choices,
		questionType: row.questionType ?? 'single',
		matchLeftItems: row.matchLeftItems,
		matchRightItems: row.matchRightItems,
		explanation: row.explanation
	}));
}

/** Practice prompts without answer keys (safe to load before submit). */
export const listByTrackCode = query({
	args: {
		trackCode: v.string(),
		mode: v.optional(practiceModeValidator),
		sessionSeed: v.optional(v.string())
	},
	handler: async (ctx, { trackCode, mode = 'sample', sessionSeed }) => {
		if (!trackCode || trackCode.length < 3 || trackCode.length > 10) {
			throw new Error('Invalid trackCode: must be 3-10 characters');
		}

		if (mode === 'full') {
			await requireAdmin(ctx);
			if (!sessionSeed || sessionSeed.length < 8) {
				throw new Error('Full mock requires a sessionSeed (min 8 characters)');
			}
		}

		const rows = await loadQuestionsForTrack(ctx, trackCode);
		const limited = limitQuestionsForSession(rows, mode, trackCode, sessionSeed);
		return mapQuestionRows(limited);
	}
});

/** Grade a practice session server-side; returns per-question results and score. */
export const gradeAnswers = mutation({
	args: {
		trackCode: v.string(),
		mode: v.optional(practiceModeValidator),
		sessionSeed: v.optional(v.string()),
		answers: v.array(answerValidator)
	},
	handler: async (ctx, { trackCode, mode = 'sample', sessionSeed, answers }) => {
		if (!trackCode || trackCode.length < 3 || trackCode.length > 10) {
			throw new Error('Invalid trackCode: must be 3-10 characters');
		}
		if (!Array.isArray(answers) || answers.length < 1 || answers.length > 1000) {
			throw new Error('Invalid answers: must have 1-1000 items');
		}
		for (const answer of answers) {
			if (answer.order < 0 || answer.order > 10000) {
				throw new Error(`Invalid order ${answer.order}: must be 0-10000`);
			}
			if (answer.selectedIndex < 0 || answer.selectedIndex > 5) {
				throw new Error(`Invalid selectedIndex ${answer.selectedIndex}: must be 0-5`);
			}
			if (answer.selectedIndexes !== undefined) {
				if (answer.selectedIndexes.length < 1 || answer.selectedIndexes.length > 6) {
					throw new Error(
						`Invalid selectedIndexes for order ${answer.order}: must have 1-6 items`
					);
				}
				for (const idx of answer.selectedIndexes) {
					if (idx < 0 || idx > 5) {
						throw new Error(`Invalid selectedIndexes value ${idx}: must be 0-5`);
					}
				}
			}
			if (answer.matchAnswers !== undefined) {
				if (answer.matchAnswers.length < 1 || answer.matchAnswers.length > 12) {
					throw new Error(
						`Invalid matchAnswers for order ${answer.order}: must have 1-12 pairs`
					);
				}
				for (const pair of answer.matchAnswers) {
					if (pair.left < 0 || pair.left > 11 || pair.right < 0 || pair.right > 11) {
						throw new Error(`Invalid matchAnswers indexes for order ${answer.order}`);
					}
				}
			}
		}

		if (mode === 'full') {
			await requireAdmin(ctx);
			if (!sessionSeed || sessionSeed.length < 8) {
				throw new Error('Full mock requires a sessionSeed (min 8 characters)');
			}
		}

		const rows = limitQuestionsForSession(
			await loadQuestionsForTrack(ctx, trackCode),
			mode,
			trackCode,
			sessionSeed
		);
		const allowedOrders = new Set(rows.map((row) => row.order));
		validateAnswersForMode(answers, allowedOrders);

		const byOrder = new Map(rows.map((row) => [row.order, row]));

		const results: {
			order: number;
			selectedIndex: number;
			selectedIndexes: number[];
			matchAnswers: MatchPair[];
			correctIndex: number;
			correctIndexes: number[];
			correctMatches: MatchPair[];
			questionType: 'single' | 'multi' | 'match';
			isCorrect: boolean;
			explanation: string;
		}[] = [];

		let correct = 0;
		for (const answer of answers) {
			const question = byOrder.get(answer.order);
			if (!question) {
				throw new Error(`No question with order ${answer.order} for track ${trackCode}`);
			}
			const questionType = question.questionType ?? 'single';
			const correctIndexes = question.correctIndexes ?? [question.correctIndex];
			const selectedIndexes = answer.selectedIndexes ?? [answer.selectedIndex];
			const correctMatches = question.correctMatches ?? [];
			const matchAnswers = answer.matchAnswers ?? [];

			// Multi-select: exact index set. Match: all pairs correct. Single: one index.
			const isCorrect =
				questionType === 'match'
					? sameMatchPairs(matchAnswers, correctMatches)
					: questionType === 'multi'
						? sameIndexSet(selectedIndexes, correctIndexes)
						: answer.selectedIndex === question.correctIndex;

			if (isCorrect) correct++;
			results.push({
				order: answer.order,
				selectedIndex: answer.selectedIndex,
				selectedIndexes,
				matchAnswers,
				correctIndex: question.correctIndex,
				correctIndexes,
				correctMatches,
				questionType,
				isCorrect,
				explanation: question.explanation
			});
		}

		return {
			correct,
			total: answers.length,
			results
		};
	}
});

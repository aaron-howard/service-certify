import { mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from './lib/authorization';
import { applyModeLimit, validateAnswersForMode } from './lib/practiceAccess';

const practiceModeValidator = v.union(v.literal('sample'), v.literal('full'));

const answerValidator = v.object({
	order: v.number(),
	selectedIndex: v.number()
});

async function loadQuestionsForTrack(ctx: QueryCtx, trackCode: string) {
	return await ctx.db
		.query('practiceQuestions')
		.withIndex('by_trackCode', (q) => q.eq('trackCode', trackCode))
		.collect();
}

function mapQuestionRows(
	rows: Awaited<ReturnType<typeof loadQuestionsForTrack>>
) {
	return rows.map((row) => ({
		order: row.order,
		prompt: row.prompt,
		choices: row.choices,
		explanation: row.explanation
	}));
}

/** Practice prompts without answer keys (safe to load before submit). */
export const listByTrackCode = query({
	args: {
		trackCode: v.string(),
		mode: v.optional(practiceModeValidator)
	},
	handler: async (ctx, { trackCode, mode = 'sample' }) => {
		if (!trackCode || trackCode.length < 3 || trackCode.length > 10) {
			throw new Error('Invalid trackCode: must be 3-10 characters');
		}

		if (mode === 'full') {
			await requireAdmin(ctx);
		}

		const rows = await loadQuestionsForTrack(ctx, trackCode);
		const limited = applyModeLimit(rows, mode);
		return mapQuestionRows(limited);
	}
});

/** Grade a practice session server-side; returns per-question results and score. */
export const gradeAnswers = mutation({
	args: {
		trackCode: v.string(),
		mode: v.optional(practiceModeValidator),
		answers: v.array(answerValidator)
	},
	handler: async (ctx, { trackCode, mode = 'sample', answers }) => {
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
		}

		if (mode === 'full') {
			await requireAdmin(ctx);
		}

		const rows = applyModeLimit(await loadQuestionsForTrack(ctx, trackCode), mode);
		const allowedOrders = new Set(rows.map((row) => row.order));
		validateAnswersForMode(answers, allowedOrders);

		const byOrder = new Map(rows.map((row) => [row.order, row]));

		const results: {
			order: number;
			selectedIndex: number;
			correctIndex: number;
			isCorrect: boolean;
			explanation: string;
		}[] = [];

		let correct = 0;
		for (const answer of answers) {
			const question = byOrder.get(answer.order);
			if (!question) {
				throw new Error(`No question with order ${answer.order} for track ${trackCode}`);
			}
			const isCorrect = answer.selectedIndex === question.correctIndex;
			if (isCorrect) correct++;
			results.push({
				order: answer.order,
				selectedIndex: answer.selectedIndex,
				correctIndex: question.correctIndex,
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

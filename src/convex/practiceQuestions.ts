import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/** Practice prompts without answer keys (safe to load before submit). */
export const listByTrackCode = query({
	args: { trackCode: v.string() },
	handler: async (ctx, { trackCode }) => {
		const rows = await ctx.db
			.query('practiceQuestions')
			.withIndex('by_trackCode', (q) => q.eq('trackCode', trackCode))
			.collect();
		return rows
			.sort((a, b) => a.order - b.order)
			.map((row) => ({
				order: row.order,
				prompt: row.prompt,
				choices: row.choices,
				explanation: row.explanation
			}));
	}
});

const answerValidator = v.object({
	order: v.number(),
	selectedIndex: v.number()
});

/** Grade a practice session server-side; returns per-question results and score. */
export const gradeAnswers = mutation({
	args: {
		trackCode: v.string(),
		answers: v.array(answerValidator)
	},
	handler: async (ctx, { trackCode, answers }) => {
		const rows = await ctx.db
			.query('practiceQuestions')
			.withIndex('by_trackCode', (q) => q.eq('trackCode', trackCode))
			.collect();
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

import { internalMutation } from './_generated/server';
import { CERTIFICATION_TRACKS_FOR_SEED } from './catalog/tracksCanonical';
import { DEV_PRACTICE_QUESTIONS } from './seed/devQuestionBank';

/** Dev / CLI: replace all certification track rows with the canonical list. */
export const apply = internalMutation({
	args: {},
	handler: async (ctx) => {
		const existing = await ctx.db.query('certificationTracks').collect();
		for (const doc of existing) {
			await ctx.db.delete(doc._id);
		}
		for (let i = 0; i < CERTIFICATION_TRACKS_FOR_SEED.length; i++) {
			const t = CERTIFICATION_TRACKS_FOR_SEED[i]!;
			await ctx.db.insert('certificationTracks', {
				code: t.code,
				officialName: t.officialCertificationName,
				sortOrder: i
			});
		}
		return { inserted: CERTIFICATION_TRACKS_FOR_SEED.length };
	}
});

/** Removes all `difficulty: dev` practice questions, then inserts the dev bank. CLI: `internal.seed.devQuestions` */
export const devQuestions = internalMutation({
	args: {},
	handler: async (ctx) => {
		const existing = await ctx.db.query('practiceQuestions').collect();
		for (const row of existing) {
			if (row.difficulty === 'dev') {
				await ctx.db.delete(row._id);
			}
		}
		for (const q of DEV_PRACTICE_QUESTIONS) {
			await ctx.db.insert('practiceQuestions', {
				trackCode: q.trackCode,
				order: q.order,
				prompt: q.prompt,
				choices: [...q.choices],
				correctIndex: q.correctIndex,
				explanation: q.explanation,
				sourceUrls: q.sourceUrls,
				difficulty: 'dev'
			});
		}
		return { inserted: DEV_PRACTICE_QUESTIONS.length };
	}
});

import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { OFFICIAL_EXAM_QUESTION_COUNTS } from '$lib/catalog/examQuestionPolicy';

const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

const TRACKS = Object.keys(OFFICIAL_EXAM_QUESTION_COUNTS);

function rowsFor(trackCode: string) {
	return DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === trackCode);
}

describe('track question choice quality', () => {
	for (const trackCode of TRACKS) {
		describe(trackCode, () => {
			const rows = rowsFor(trackCode);

			it('has no rebalance boilerplate suffixes', () => {
				for (const q of rows) {
					for (const choice of q.choices) {
						for (const suffix of BOILERPLATE_SUFFIXES) {
							expect(choice).not.toContain(suffix);
						}
					}
				}
			});

			it('has four unique choices per question', () => {
				for (const q of rows) {
					if (q.questionType === 'match') continue;
					const normalized = q.choices.map((c) => c.trim().toLowerCase());
					expect(new Set(normalized).size).toBe(4);
				}
			});

			it('does not repeat identical choice text within the track', () => {
				const seen = new Map<string, number>();
				for (const q of rows) {
					if (q.questionType === 'match') continue;
					for (const choice of q.choices) {
						const key = choice.trim().toLowerCase();
						seen.set(key, (seen.get(key) ?? 0) + 1);
					}
				}
				const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
				expect(duplicates).toEqual([]);
			});

			it('avoids universal longest-correct bias', () => {
				if (rows.length === 0) return;
				const mcRows = rows.filter((q) => q.questionType !== 'match');
				if (mcRows.length === 0) return;
				let longestCorrect = 0;
				for (const q of mcRows) {
					const maxLen = Math.max(...q.choices.map((c) => c.length));
					if (q.choices[q.correctIndex].length === maxLen) longestCorrect++;
				}
				expect(longestCorrect).toBeLessThan(mcRows.length * 0.85);
			});
		});
	}
});

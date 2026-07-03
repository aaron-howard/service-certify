import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';

const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

const TRACK = 'CIS-DISCO';

describe('CIS-DISCO question quality', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 90 bank questions with contiguous orders', () => {
		expect(rows).toHaveLength(90);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual([...Array(90).keys()]);
	});

	it('has no rebalance boilerplate suffixes in choices', () => {
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
			const normalized = q.choices.map((c) => c.trim().toLowerCase());
			expect(new Set(normalized).size).toBe(4);
		}
	});

	it('does not repeat identical choice text across the track', () => {
		const seen = new Map<string, number>();
		for (const q of rows) {
			for (const choice of q.choices) {
				const key = choice.trim().toLowerCase();
				seen.set(key, (seen.get(key) ?? 0) + 1);
			}
		}
		const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
		expect(duplicates).toEqual([]);
	});

	it('avoids making the correct choice the longest option on every question', () => {
		let longestCorrect = 0;
		for (const q of rows) {
			const maxLen = Math.max(...q.choices.map((c) => c.length));
			if (q.choices[q.correctIndex].length === maxLen) longestCorrect++;
		}
		expect(longestCorrect).toBeLessThan(rows.length * 0.85);
	});
});

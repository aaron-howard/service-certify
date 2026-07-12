import { describe, expect, it } from 'vitest';
import { clampIndex, questionStatus, unansweredIndexes } from './sessionNav';

describe('sessionNav', () => {
	it('clampIndex bounds to valid range', () => {
		expect(clampIndex(-1, 5)).toBe(0);
		expect(clampIndex(3, 5)).toBe(3);
		expect(clampIndex(9, 5)).toBe(4);
		expect(clampIndex(0, 0)).toBe(0);
	});

	it('unansweredIndexes lists gaps', () => {
		const answered = (i: number) => i === 0 || i === 2;
		expect(unansweredIndexes(4, answered)).toEqual([1, 3]);
	});

	it('questionStatus prefers flagged over answered', () => {
		const flagged = new Set([1]);
		expect(questionStatus(0, () => false, flagged)).toBe('unanswered');
		expect(questionStatus(1, () => true, flagged)).toBe('flagged');
		expect(questionStatus(2, () => true, flagged)).toBe('answered');
	});
});

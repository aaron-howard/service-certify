import { describe, expect, it } from 'vitest';
import { applyModeLimit, validateAnswersForMode } from './practiceAccess';

const questions = [
	{ order: 2, prompt: 'C' },
	{ order: 0, prompt: 'A' },
	{ order: 1, prompt: 'B' },
	{ order: 3, prompt: 'D' },
	{ order: 4, prompt: 'E' }
];

describe('practiceAccess helpers', () => {
	it('returns the first three questions in sample mode', () => {
		const limited = applyModeLimit(questions, 'sample');
		expect(limited.map((q) => q.order)).toEqual([0, 1, 2]);
	});

	it('returns all questions in full mode', () => {
		const limited = applyModeLimit(questions, 'full');
		expect(limited.map((q) => q.order)).toEqual([0, 1, 2, 3, 4]);
	});

	it('rejects answers outside the allowed order set', () => {
		const allowed = new Set([0, 1, 2]);
		expect(() => validateAnswersForMode([{ order: 0 }, { order: 3 }], allowed)).toThrow(
			/not available in this practice mode/
		);
	});

	it('accepts answers within the allowed order set', () => {
		const allowed = new Set([0, 1, 2]);
		expect(() => validateAnswersForMode([{ order: 0 }, { order: 2 }], allowed)).not.toThrow();
	});
});

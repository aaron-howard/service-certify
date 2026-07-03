import { describe, expect, it } from 'vitest';
import { applyModeLimit, seededShuffle, validateAnswersForMode } from './practiceAccess';

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

	it('returns all questions in full mode when bank is smaller than attempt count', () => {
		const limited = applyModeLimit(questions, 'full', { attemptQuestionCount: 10 });
		expect(limited.map((q) => q.order)).toEqual([0, 1, 2, 3, 4]);
	});

	it('returns a deterministic random subset for full mocks', () => {
		const first = applyModeLimit(questions, 'full', {
			attemptQuestionCount: 3,
			sessionSeed: 'session-abc'
		});
		const second = applyModeLimit(questions, 'full', {
			attemptQuestionCount: 3,
			sessionSeed: 'session-abc'
		});
		const other = applyModeLimit(questions, 'full', {
			attemptQuestionCount: 3,
			sessionSeed: 'session-xyz'
		});

		expect(first.map((q) => q.order)).toEqual(second.map((q) => q.order));
		expect(first).toHaveLength(3);
		expect(other.map((q) => q.order)).not.toEqual(first.map((q) => q.order));
	});

	it('seededShuffle is stable for the same seed', () => {
		const a = seededShuffle(questions, 'stable-seed').map((q) => q.order);
		const b = seededShuffle(questions, 'stable-seed').map((q) => q.order);
		expect(a).toEqual(b);
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

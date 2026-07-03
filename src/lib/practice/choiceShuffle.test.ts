import { describe, expect, it } from 'vitest';
import {
	applyChoicePermutation,
	choicePermutationForSeed,
	displayIndexToOriginal,
	originalIndexToDisplay,
	shuffleChoicesForDisplay
} from './choiceShuffle';

describe('choiceShuffle', () => {
	it('produces stable permutations for the same seed', () => {
		const a = choicePermutationForSeed(4, 'session:12');
		const b = choicePermutationForSeed(4, 'session:12');
		expect(a).toEqual(b);
	});

	it('maps display selections back to original indices', () => {
		const choices = ['A', 'B', 'C', 'D'];
		const { choices: shuffled, permutation } = shuffleChoicesForDisplay(choices, 'seed', 7);
		expect(shuffled).toHaveLength(4);
		expect(new Set(shuffled)).toEqual(new Set(choices));

		const displayIndex = 2;
		const original = displayIndexToOriginal(displayIndex, permutation);
		expect(choices[original]).toBe(shuffled[displayIndex]);
		expect(originalIndexToDisplay(original, permutation)).toBe(displayIndex);
	});

	it('permutes all indices exactly once', () => {
		const permutation = choicePermutationForSeed(4, 'x');
		expect([...permutation].sort()).toEqual([0, 1, 2, 3]);
		expect(applyChoicePermutation(['a', 'b', 'c', 'd'], permutation)).toHaveLength(4);
	});
});

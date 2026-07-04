import { describe, expect, it } from 'vitest';
import {
	applyChoicePermutation,
	choicePermutationForSeed,
	displayIndexToOriginal,
	originalIndexToDisplay,
	shuffleChoicesForDisplay,
	shuffleMatchForDisplay
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

	it('shuffles match columns independently and maps answers back to bank indices', () => {
		const left = ['L0', 'L1', 'L2', 'L3'];
		const right = ['R0', 'R1', 'R2', 'R3'];
		const { matchLeftItems, matchRightItems, matchLeftPermutation, matchRightPermutation } =
			shuffleMatchForDisplay(left, right, 'session-seed', 42);

		expect(matchLeftItems).toHaveLength(4);
		expect(matchRightItems).toHaveLength(4);
		expect(new Set(matchLeftItems)).toEqual(new Set(left));
		expect(new Set(matchRightItems)).toEqual(new Set(right));

		// Sequential bank answers 0→0, 1→1… become non-aligned in display space.
		const displayPairs = matchLeftPermutation.map((originalLeft, displayLeft) => {
			const originalRight = originalLeft;
			const displayRight = originalIndexToDisplay(originalRight, matchRightPermutation);
			return { displayLeft, displayRight };
		});
		const aligned = displayPairs.every(({ displayLeft, displayRight }) => displayLeft === displayRight);
		expect(aligned).toBe(false);

		for (const { displayLeft, displayRight } of displayPairs) {
			expect(displayIndexToOriginal(displayLeft, matchLeftPermutation)).toBe(
				displayIndexToOriginal(displayRight, matchRightPermutation)
			);
		}
	});
});

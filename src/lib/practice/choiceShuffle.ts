/** Deterministic hash for stable per-question shuffles within a session. */
function hashString(seed: string): number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
	}
	return hash >>> 0;
}

/** Fisher–Yates shuffle using a seeded PRNG; returns permutation[displayIndex] = originalIndex. */
export function choicePermutationForSeed(length: number, seed: string): number[] {
	const permutation = Array.from({ length }, (_, i) => i);
	let state = hashString(seed) || 1;
	for (let i = length - 1; i > 0; i--) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const j = state % (i + 1);
		[permutation[i], permutation[j]] = [permutation[j], permutation[i]];
	}
	return permutation;
}

export function applyChoicePermutation(
	choices: string[],
	permutation: number[]
): string[] {
	return permutation.map((originalIndex) => choices[originalIndex]!);
}

/** Map a display-space selected index back to the stored bank index for grading. */
export function displayIndexToOriginal(
	displayIndex: number,
	permutation: number[]
): number {
	return permutation[displayIndex]!;
}

/** Map stored correctIndex to display-space for highlighting after grade. */
export function originalIndexToDisplay(
	originalIndex: number,
	permutation: number[]
): number {
	return permutation.indexOf(originalIndex);
}

export function shuffleChoicesForDisplay(
	choices: string[],
	sessionSeed: string,
	questionOrder: number
): { choices: string[]; permutation: number[] } {
	const permutation = choicePermutationForSeed(choices.length, `${sessionSeed}:${questionOrder}`);
	return {
		choices: applyChoicePermutation(choices, permutation),
		permutation
	};
}

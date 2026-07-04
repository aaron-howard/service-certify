/**
 * Rebalance stored MCQ choices by shuffling option order (updates correctIndex).
 * Does not append shared boilerplate text — use per-question distractor rewrites instead.
 *
 * Usage: node scripts/rebalance-question-choices.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

function hashString(seed) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
	}
	return hash >>> 0;
}

function choicePermutationForSeed(length, seed) {
	const permutation = Array.from({ length }, (_, i) => i);
	let state = hashString(seed) || 1;
	for (let i = length - 1; i > 0; i--) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const j = state % (i + 1);
		[permutation[i], permutation[j]] = [permutation[j], permutation[i]];
	}
	return permutation;
}

function rebalanceQuestion(q) {
	if (q.questionType === 'match' || !q.choices?.length) return q;
	const permutation = choicePermutationForSeed(
		q.choices.length,
		`bank:${q.trackCode}:${q.order}`
	);
	const choices = permutation.map((i) => q.choices[i]);
	const correctIndex = permutation.indexOf(q.correctIndex);
	const next = { ...q, choices, correctIndex };
	if (q.questionType === 'multi' && Array.isArray(q.correctIndexes)) {
		const remapped = q.correctIndexes
			.map((i) => permutation.indexOf(i))
			.sort((a, b) => a - b);
		next.correctIndexes = remapped;
		next.correctIndex = remapped[0] ?? correctIndex;
	}
	return next;
}

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) throw new Error('Could not parse devQuestionBank.ts');
	return JSON.parse(match[1]);
}

function writeBank(all) {
	const body = `import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev question bank; merge batches: \`node scripts/extract-questions-from-transcripts.mjs --merge-batches\` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = ${JSON.stringify(all, null, '\t')};
`;
	fs.writeFileSync(bankPath, body, 'utf8');
}

const bank = readBank();
const rebalanced = bank.map(rebalanceQuestion);

writeBank(rebalanced);
console.log(`Shuffled choice order for ${rebalanced.length} questions`);

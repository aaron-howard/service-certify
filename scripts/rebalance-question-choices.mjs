/**
 * Rebalance stored MCQ choices: shuffle order (update correctIndex) and lengthen
 * short distractors when the correct answer is an obvious length outlier.
 *
 * Usage: node scripts/rebalance-question-choices.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

const GENERIC_WRONG_EXTENSIONS = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

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

function longestCorrectCount(questions) {
	let count = 0;
	for (const q of questions) {
		const max = Math.max(...q.choices.map((c) => c.length));
		if (q.choices[q.correctIndex].length === max) count++;
	}
	return count;
}

function rebalanceQuestion(q) {
	const permutation = choicePermutationForSeed(
		q.choices.length,
		`bank:${q.trackCode}:${q.order}`
	);
	const shuffledChoices = permutation.map((i) => q.choices[i]);
	const shuffledCorrect = permutation.indexOf(q.correctIndex);

	const correctLen = shuffledChoices[shuffledCorrect].length;
	const wrongIndices = shuffledChoices.map((_, i) => i).filter((i) => i !== shuffledCorrect);
	const avgWrongLen =
		wrongIndices.reduce((sum, i) => sum + shuffledChoices[i].length, 0) / wrongIndices.length;

	const choices = shuffledChoices.map((text, i) => {
		if (i === shuffledCorrect) return text;
		if (correctLen <= avgWrongLen * 1.1) return text;
		if (text.length >= correctLen * 0.75) return text;
		const ext =
			GENERIC_WRONG_EXTENSIONS[
				hashString(`${q.trackCode}:${q.order}:${i}`) % GENERIC_WRONG_EXTENSIONS.length
			];
		return `${text}${ext}`;
	});

	return { ...q, choices, correctIndex: shuffledCorrect };
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
const before = longestCorrectCount(bank);
const rebalanced = bank.map(rebalanceQuestion);
const after = longestCorrectCount(rebalanced);

writeBank(rebalanced);
console.log(`Rebalanced ${rebalanced.length} questions`);
console.log(`Longest-correct bias: ${before} -> ${after} (${((after / rebalanced.length) * 100).toFixed(1)}%)`);

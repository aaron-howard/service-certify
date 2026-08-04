#!/usr/bin/env node
/**
 * Rebalance MCQ choice order so correctIndex is evenly distributed per track.
 * Remaps correctIndexes for multi-select. Skips match items.
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

/** Build a permutation that moves `fromIndex` → `toIndex`, with remaining slots shuffled. */
function permutationMoving(length, fromIndex, toIndex, seed) {
	const sources = Array.from({ length }, (_, i) => i);
	sources.splice(fromIndex, 1);
	let state = hashString(seed) || 1;
	for (let i = sources.length - 1; i > 0; i--) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const j = state % (i + 1);
		[sources[i], sources[j]] = [sources[j], sources[i]];
	}
	const permutation = Array(length);
	permutation[toIndex] = fromIndex;
	let si = 0;
	for (let dest = 0; dest < length; dest++) {
		if (dest === toIndex) continue;
		permutation[dest] = sources[si++];
	}
	return permutation;
}

function applyPermutation(q, permutation) {
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

function rebalanceTrack(rows) {
	const singleLike = rows
		.map((q, idx) => ({ q, idx }))
		.filter(({ q }) => q.questionType !== 'match' && Array.isArray(q.choices) && q.choices.length >= 2);

	// Round-robin target slots for single-answer items; multi keeps relative keys via permutation.
	const singles = singleLike.filter(({ q }) => q.questionType !== 'multi');
	const multis = singleLike.filter(({ q }) => q.questionType === 'multi');

	const out = rows.slice();
	singles.forEach(({ q, idx }, n) => {
		const target = n % q.choices.length;
		if (q.correctIndex === target) return;
		const permutation = permutationMoving(
			q.choices.length,
			q.correctIndex,
			target,
			`balance:${q.trackCode}:${q.order}:${target}`
		);
		out[idx] = applyPermutation(q, permutation);
	});

	// Light shuffle for multi so keys aren't stuck; distribute first correctIndex.
	multis.forEach(({ q, idx }, n) => {
		const target = n % q.choices.length;
		const permutation = permutationMoving(
			q.choices.length,
			q.correctIndex,
			target,
			`balance-multi:${q.trackCode}:${q.order}:${target}`
		);
		out[idx] = applyPermutation(q, permutation);
	});

	return out;
}

const bank = readBank();
const byTrack = new Map();
for (const q of bank) {
	if (!byTrack.has(q.trackCode)) byTrack.set(q.trackCode, []);
	byTrack.get(q.trackCode).push(q);
}

const rebalanced = [];
for (const trackCode of [...byTrack.keys()].sort()) {
	rebalanced.push(...rebalanceTrack(byTrack.get(trackCode)));
}

// Preserve original global order (by original bank sequence)
const key = (q) => `${q.trackCode}::${q.order}`;
const map = new Map(rebalanced.map((q) => [key(q), q]));
const ordered = bank.map((q) => map.get(key(q)) ?? q);

writeBank(ordered);

// Report distribution
for (const trackCode of [...byTrack.keys()].sort()) {
	const qs = ordered.filter(
		(q) => q.trackCode === trackCode && q.questionType !== 'match' && q.questionType !== 'multi'
	);
	if (!qs.length) continue;
	const counts = Array(Math.max(...qs.map((q) => q.choices.length))).fill(0);
	for (const q of qs) counts[q.correctIndex]++;
	const max = Math.max(...counts);
	const pct = ((100 * max) / qs.length).toFixed(1);
	console.log(`${trackCode}: n=${qs.length} idx=${JSON.stringify(counts)} max=${pct}%`);
}
console.log(`\nRebalanced ${ordered.length} questions → even key positions per track`);

/**
 * Strip leftover `(TRACK-N-wN)` length-balance tracking tags from choice text.
 * Usage: node scripts/strip-boilerplate-choice-tags.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');
const dryRun = process.argv.includes('--dry-run');
const TAG = /\s*\([A-Z][A-Z0-9-]*-\d+-w\d+\)\s*$/;

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const marker = 'export const DEV_PRACTICE_QUESTIONS';
	const markerAt = raw.indexOf(marker);
	const start = raw.indexOf('[', markerAt);
	const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
	const plainEnd = raw.lastIndexOf('];');
	const end = castEnd >= 0 ? castEnd : plainEnd;
	return JSON.parse(raw.slice(start, end + 1));
}

function writeBank(all) {
	const body = `// @ts-nocheck — large generated bank exceeds TS2590 union limits
import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev question bank; merge batches: \`node scripts/extract-questions-from-transcripts.mjs --merge-batches\` */
export const DEV_PRACTICE_QUESTIONS = ${JSON.stringify(all, null, '\t')} as unknown as DevPracticeQuestionRow[];
`;
	fs.writeFileSync(bankPath, body, 'utf8');
}

const bank = readBank();
let stripped = 0;
const samples = [];
for (const q of bank) {
	if (!Array.isArray(q.choices)) continue;
	q.choices = q.choices.map((c) => {
		const next = c.replace(TAG, '').trimEnd();
		if (next !== c) {
			stripped++;
			if (samples.length < 8) samples.push(`${q.trackCode}:${q.order}`);
		}
		return next;
	});
}

console.log(`Found ${stripped} tagged choices`, samples);
if (!dryRun && stripped > 0) {
	writeBank(bank);
	console.log(`Updated ${bankPath}`);
} else if (dryRun) {
	console.log('Dry run — no files written.');
} else {
	console.log('Nothing to strip.');
}

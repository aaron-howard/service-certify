/**
 * Restore one track's questions from original batch JSON (and optional pre-rebalance
 * orders), replacing rebalance-script boilerplate distractors.
 *
 * Usage: node scripts/restore-track-questions.mjs CIS-DISCO
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const bankPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');
const batchesDir = path.join(root, 'scripts', 'question-batches');

/** Boilerplate appended by rebalance-question-choices.mjs — must not appear in choices. */
export const BOILERPLATE_SUFFIXES = [
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

function shuffleQuestionChoices(q) {
	const permutation = choicePermutationForSeed(
		q.choices.length,
		`restore:${q.trackCode}:${q.order}`
	);
	const choices = permutation.map((i) => q.choices[i]);
	const correctIndex = permutation.indexOf(q.correctIndex);
	return { ...q, choices, correctIndex };
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

function loadBatchQuestions(trackCode) {
	const map = new Map();
	for (const file of fs.readdirSync(batchesDir).filter((f) => f.endsWith('.json'))) {
		const arr = JSON.parse(fs.readFileSync(path.join(batchesDir, file), 'utf8'));
		for (const q of arr) {
			if (q.trackCode === trackCode) {
				map.set(q.order, q);
			}
		}
	}
	return map;
}

function loadPreRebalanceOrders(trackCode, orders) {
	const parent = execSync('git rev-parse 6bba326^', { cwd: root, encoding: 'utf8' }).trim();
	const raw = execSync(`git show ${parent}:src/convex/seed/devQuestionBank.ts`, {
		cwd: root,
		encoding: 'utf8',
		maxBuffer: 50 * 1024 * 1024
	});
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) throw new Error('Could not parse pre-rebalance bank');
	const bank = JSON.parse(match[1]);
	const map = new Map();
	for (const q of bank) {
		if (q.trackCode === trackCode && orders.includes(q.order)) {
			map.set(q.order, q);
		}
	}
	return map;
}

function stripBoilerplate(text) {
	for (const suffix of BOILERPLATE_SUFFIXES) {
		if (text.endsWith(suffix)) {
			return text.slice(0, -suffix.length);
		}
	}
	return text;
}

function hasBoilerplate(q) {
	return q.choices.some((c) => BOILERPLATE_SUFFIXES.some((s) => c.includes(s)));
}

const trackArg = process.argv[2];
if (!trackArg) {
	console.error('Usage: node scripts/restore-track-questions.mjs <TRACK_CODE|--all>');
	process.exit(1);
}

function restoreTrack(trackCode, bank) {
	const batchMap = loadBatchQuestions(trackCode);
	const existing = bank.filter((q) => q.trackCode === trackCode);
	const existingOrders = new Set(existing.map((q) => q.order));
	const missingFromBatches = [...existingOrders].filter((o) => !batchMap.has(o));

	for (const order of missingFromBatches) {
		const fromGit = loadPreRebalanceOrders(trackCode, [order]);
		if (fromGit.has(order)) {
			batchMap.set(order, fromGit.get(order));
		}
	}

	const restored = [...batchMap.values()]
		.sort((a, b) => a.order - b.order)
		.map(shuffleQuestionChoices);

	const restoredOrders = new Set(restored.map((q) => q.order));
	const stillMissing = [...existingOrders].filter((o) => !restoredOrders.has(o));
	if (stillMissing.length) {
		console.warn(`Warning: ${trackCode} could not restore orders: ${stillMissing.join(', ')}`);
	}

	for (const q of restored) {
		if (hasBoilerplate(q)) {
			q.choices = q.choices.map(stripBoilerplate);
		}
		const unique = new Set(q.choices.map((c) => c.trim().toLowerCase()));
		if (unique.size !== 4) {
			throw new Error(`Duplicate choices remain for ${trackCode} order ${q.order}`);
		}
	}

	return { restored, removed: existing.length };
}

let bank = readBank();

if (trackArg === '--all') {
	const tracks = [...new Set(bank.map((q) => q.trackCode))].sort();
	let total = 0;
	for (const trackCode of tracks) {
		if (trackCode === 'CIS-DISCO') {
			console.log(`Skipping ${trackCode} (already fixed)`);
			continue;
		}
		const { restored } = restoreTrack(trackCode, bank);
		bank = [...bank.filter((q) => q.trackCode !== trackCode), ...restored];
		total += restored.length;
		console.log(`Restored ${restored.length} ${trackCode} questions`);
	}
	bank.sort((a, b) => {
		if (a.trackCode !== b.trackCode) return a.trackCode.localeCompare(b.trackCode);
		return a.order - b.order;
	});
	writeBank(bank);
	console.log(`Restored ${total} questions across ${tracks.length - 1} tracks`);
	process.exit(0);
}

const trackCode = trackArg;
const { restored } = restoreTrack(trackCode, bank);

const merged = [
	...bank.filter((q) => q.trackCode !== trackCode),
	...restored
].sort((a, b) => {
	if (a.trackCode !== b.trackCode) return a.trackCode.localeCompare(b.trackCode);
	return a.order - b.order;
});

writeBank(merged);
console.log(`Restored ${restored.length} ${trackCode} questions from batch sources`);

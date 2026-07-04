/**
 * Parse Convex question batches from Cursor subagent .jsonl transcripts or JSON batch
 * files and write/merge src/convex/seed/devQuestionBank.ts
 *
 * Usage (from repo root):
 *   node scripts/extract-questions-from-transcripts.mjs
 *   node scripts/extract-questions-from-transcripts.mjs --merge-batches
 *   node scripts/extract-questions-from-transcripts.mjs --merge-batches scripts/question-batches/phase1-batch1.json
 *
 * Env:
 *   TRANSCRIPT_SUBAGENTS — override path to subagent .jsonl folder
 *   MIN_PER_TRACK — minimum questions per track (optional)
 *   MAX_PER_TRACK — maximum questions per track (optional)
 *   EXPECTED_PER_TRACK — exact count per track if set (legacy default for transcript-only mode: 5)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');
const batchesDir = path.join(root, 'scripts', 'question-batches');

const defaultSubagents = path.join(
	process.env.USERPROFILE || process.env.HOME || '',
	'.cursor',
	'projects',
	'd-repos-service-certify',
	'agent-transcripts',
	'353210b7-5b2d-43d5-8181-6ba05764f9bc',
	'subagents'
);

const LEGACY_TRANSCRIPT_FILES = [
	'46036090-f6d0-4337-8a58-c5d2182b55e2.jsonl',
	'1eef110e-009e-409d-86d0-3af146308b7d.jsonl',
	'ba2e8bd2-d47d-4603-b395-d5bb1c29ed05.jsonl',
	'57825fc6-32ba-4614-abb7-1321601e7d87.jsonl'
];

const args = process.argv.slice(2);
const mergeBatches = args.includes('--merge-batches');
const batchFileArgs = args.filter((a) => !a.startsWith('--'));

const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

/** Parse first top-level JSON array in text (handles prose before `[{...}]`). */
function parseFirstJsonArray(text) {
	const start = text.indexOf('[');
	if (start === -1) return null;
	let depth = 0;
	let inString = false;
	let escape = false;
	for (let i = start; i < text.length; i++) {
		const c = text[i];
		if (escape) {
			escape = false;
			continue;
		}
		if (c === '\\' && inString) {
			escape = true;
			continue;
		}
		if (c === '"' && !inString) inString = true;
		else if (c === '"' && inString) inString = false;
		if (inString) continue;
		if (c === '[') depth++;
		if (c === ']') {
			depth--;
			if (depth === 0) {
				try {
					return JSON.parse(text.slice(start, i + 1));
				} catch {
					return null;
				}
			}
		}
	}
	return null;
}

function escapeRegExp(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractLargestJsonArrayFromJsonl(filePath) {
	const raw = fs.readFileSync(filePath, 'utf8');
	let best = null;
	for (const line of raw.split('\n')) {
		if (!line.trim()) continue;
		let o;
		try {
			o = JSON.parse(line);
		} catch {
			continue;
		}
		if (o.role !== 'assistant') continue;
		const t = o.message?.content?.[0]?.text;
		if (typeof t !== 'string') continue;
		const arr = parseFirstJsonArray(t);
		if (Array.isArray(arr) && (!best || arr.length > best.length)) best = arr;
	}
	if (!best) throw new Error(`No JSON array found in ${filePath}`);
	return best;
}

function readExistingBank() {
	if (!fs.existsSync(outPath)) return [];
	const raw = fs.readFileSync(outPath, 'utf8');
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) return [];
	return JSON.parse(match[1]);
}

function loadJsonBatch(filePath) {
	const raw = fs.readFileSync(filePath, 'utf8').trim();
	if (raw.startsWith('[')) return JSON.parse(raw);
	const arr = parseFirstJsonArray(raw);
	if (!arr) throw new Error(`No JSON array in ${filePath}`);
	return arr;
}

function resolveBatchFiles() {
	if (batchFileArgs.length > 0) {
		return batchFileArgs.flatMap((pattern) => {
			if (pattern.includes('*')) {
				const dir = path.dirname(pattern);
				const base = path.basename(pattern);
				const safePattern = base
					.split('*')
					.map((part) => escapeRegExp(part))
					.join('.*');
				const re = new RegExp('^' + safePattern + '$');
				return fs
					.readdirSync(dir === '.' ? batchesDir : dir)
					.filter((f) => re.test(f))
					.map((f) => path.join(dir === '.' ? batchesDir : dir, f))
					.sort();
			}
			return [path.isAbsolute(pattern) ? pattern : path.join(root, pattern)];
		});
	}
	if (!fs.existsSync(batchesDir)) return [];
	return fs
		.readdirSync(batchesDir)
		.filter((f) => f.endsWith('.json'))
		.sort()
		.map((f) => path.join(batchesDir, f));
}

function validateQuestion(q, { warnDuplicates = true } = {}) {
	if (!q.trackCode || typeof q.order !== 'number') {
		throw new Error('missing trackCode/order');
	}
	const questionType = q.questionType ?? 'single';
	if (questionType !== 'single' && questionType !== 'multi' && questionType !== 'match') {
		throw new Error(`track ${q.trackCode} order ${q.order}: bad questionType`);
	}

	if (questionType === 'match') {
		if (!Array.isArray(q.choices)) {
			throw new Error(`track ${q.trackCode} order ${q.order}: match questions need choices array`);
		}
		const left = q.matchLeftItems ?? [];
		const right = q.matchRightItems ?? [];
		const pairs = q.correctMatches ?? [];
		if (left.length < 2 || right.length < 2) {
			throw new Error(
				`track ${q.trackCode} order ${q.order}: match questions need matchLeftItems and matchRightItems`
			);
		}
		if (pairs.length < left.length) {
			throw new Error(
				`track ${q.trackCode} order ${q.order}: correctMatches must cover each left item`
			);
		}
	} else {
		if (!Array.isArray(q.choices) || q.choices.length !== 4) {
			throw new Error(`track ${q.trackCode} order ${q.order}: need 4 choices`);
		}
		if (q.correctIndex < 0 || q.correctIndex > 3) {
			throw new Error(`track ${q.trackCode} order ${q.order}: bad correctIndex`);
		}
		const normalizedChoices = q.choices.map((c) => c.trim().toLowerCase());
		if (new Set(normalizedChoices).size !== 4) {
			throw new Error(`track ${q.trackCode} order ${q.order}: duplicate choices in same question`);
		}
		for (const choice of q.choices) {
			for (const suffix of BOILERPLATE_SUFFIXES) {
				if (choice.includes(suffix)) {
					throw new Error(
						`track ${q.trackCode} order ${q.order}: choice uses shared boilerplate suffix`
					);
				}
			}
		}
	}

	if (questionType === 'multi') {
		if (!Array.isArray(q.correctIndexes) || q.correctIndexes.length < 2) {
			throw new Error(
				`track ${q.trackCode} order ${q.order}: multi questions need 2+ correctIndexes`
			);
		}
		const sorted = [...q.correctIndexes].sort((a, b) => a - b);
		for (const idx of sorted) {
			if (idx < 0 || idx > 3) {
				throw new Error(`track ${q.trackCode} order ${q.order}: correctIndexes out of range`);
			}
		}
		if (new Set(sorted).size !== sorted.length) {
			throw new Error(`track ${q.trackCode} order ${q.order}: duplicate correctIndexes`);
		}
		if (sorted[0] !== q.correctIndex) {
			throw new Error(
				`track ${q.trackCode} order ${q.order}: correctIndex must equal first (lowest) correctIndexes entry`
			);
		}
	} else if (q.correctIndexes !== undefined && questionType !== 'match') {
		throw new Error(
			`track ${q.trackCode} order ${q.order}: correctIndexes only valid for multi questions`
		);
	}
	if (!q.prompt?.trim()) {
		throw new Error(`track ${q.trackCode} order ${q.order}: empty prompt`);
	}
	if (!q.explanation?.trim()) {
		throw new Error(`track ${q.trackCode} order ${q.order}: empty explanation`);
	}
	if (!Array.isArray(q.sourceUrls) || q.sourceUrls.length === 0) {
		throw new Error(`track ${q.trackCode} order ${q.order}: need sourceUrls`);
	}
	return warnDuplicates;
}

function validateBank(all, { expectedPerTrack, minPerTrack, maxPerTrack, tracksInBatch } = {}) {
	const byTrack = new Map();
	const promptsByTrack = new Map();

	for (const q of all) {
		validateQuestion(q);
		const key = `${q.trackCode}:${q.order}`;
		if (byTrack.has(key)) {
			throw new Error(`duplicate trackCode+order: ${key}`);
		}
		byTrack.set(key, q);

		const prompts = promptsByTrack.get(q.trackCode) || new Set();
		const norm = q.prompt.trim().toLowerCase();
		if (prompts.has(norm)) {
			console.warn(`WARN: duplicate prompt in track ${q.trackCode}: ${q.prompt.slice(0, 60)}...`);
		}
		prompts.add(norm);
		promptsByTrack.set(q.trackCode, prompts);
	}

	const counts = new Map();
	for (const q of all) {
		counts.set(q.trackCode, (counts.get(q.trackCode) || 0) + 1);
	}

	const tracksToCheck = tracksInBatch ? [...tracksInBatch] : [...counts.keys()];
	for (const code of tracksToCheck) {
		const n = counts.get(code) || 0;
		if (expectedPerTrack != null && n !== expectedPerTrack) {
			throw new Error(`track ${code}: expected ${expectedPerTrack} questions, got ${n}`);
		}
		if (minPerTrack != null && n < minPerTrack) {
			throw new Error(`track ${code}: minimum ${minPerTrack} questions, got ${n}`);
		}
		if (maxPerTrack != null && n > maxPerTrack) {
			throw new Error(`track ${code}: maximum ${maxPerTrack} questions, got ${n}`);
		}
	}
}

function mergeQuestions(existing, incoming) {
	const map = new Map();
	for (const q of existing) {
		map.set(`${q.trackCode}:${q.order}`, q);
	}
	for (const q of incoming) {
		map.set(`${q.trackCode}:${q.order}`, q);
	}
	return [...map.values()].sort((a, b) => {
		if (a.trackCode !== b.trackCode) return a.trackCode.localeCompare(b.trackCode);
		return a.order - b.order;
	});
}

function writeBank(all) {
	const body = `import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev question bank; merge batches: \`node scripts/extract-questions-from-transcripts.mjs --merge-batches\` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = ${JSON.stringify(all, null, '\t')};
`;
	fs.writeFileSync(outPath, body, 'utf8');
	console.log('Wrote', outPath, 'count=', all.length);
}

function envInt(name) {
	const v = process.env[name];
	return v != null && v !== '' ? Number(v) : undefined;
}

let incoming = [];
let tracksInBatch = null;

if (mergeBatches) {
	const files = resolveBatchFiles();
	if (files.length === 0) {
		console.error('No batch JSON files found. Pass paths or add files to scripts/question-batches/');
		process.exit(1);
	}
	for (const fp of files) {
		if (!fs.existsSync(fp)) {
			console.error('Missing batch file:', fp);
			process.exit(1);
		}
		console.log('Loading', fp);
		incoming.push(...loadJsonBatch(fp));
	}
	tracksInBatch = new Set(incoming.map((q) => q.trackCode));
	const existing = readExistingBank();
	const merged = mergeQuestions(existing, incoming);
	validateBank(merged, {
		expectedPerTrack: envInt('EXPECTED_PER_TRACK'),
		minPerTrack: envInt('MIN_PER_TRACK'),
		maxPerTrack: envInt('MAX_PER_TRACK')
	});
	writeBank(merged);
} else {
	const subagentsDir = process.env.TRANSCRIPT_SUBAGENTS || defaultSubagents;
	for (const f of LEGACY_TRANSCRIPT_FILES) {
		const fp = path.join(subagentsDir, f);
		if (!fs.existsSync(fp)) {
			console.error('Missing transcript file:', fp);
			process.exit(1);
		}
		incoming.push(...extractLargestJsonArrayFromJsonl(fp));
	}
	const expectedPerTrack = envInt('EXPECTED_PER_TRACK') ?? 5;
	validateBank(incoming, { expectedPerTrack });
	writeBank(incoming);
}

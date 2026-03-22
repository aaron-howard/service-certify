/**
 * One-off / local regeneration: parse Convex question batches from Cursor subagent .jsonl
 * transcripts and write src/convex/seed/devQuestionBank.ts
 *
 * Usage (from repo root):
 *   node scripts/extract-questions-from-transcripts.mjs
 *
 * Override transcript folder:
 *   set TRANSCRIPT_SUBAGENTS=C:\path\to\...\subagents
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const defaultSubagents = path.join(
	process.env.USERPROFILE || '',
	'.cursor',
	'projects',
	'd-repos-service-certify',
	'agent-transcripts',
	'353210b7-5b2d-43d5-8181-6ba05764f9bc',
	'subagents'
);

const subagentsDir = process.env.TRANSCRIPT_SUBAGENTS || defaultSubagents;

const FILES = [
	'46036090-f6d0-4337-8a58-c5d2182b55e2.jsonl',
	'1eef110e-009e-409d-86d0-3af146308b7d.jsonl',
	'ba2e8bd2-d47d-4603-b395-d5bb1c29ed05.jsonl',
	'57825fc6-32ba-4614-abb7-1321601e7d87.jsonl'
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

function validate(all) {
	const byTrack = new Map();
	for (const q of all) {
		if (!q.trackCode || typeof q.order !== 'number') throw new Error('missing trackCode/order');
		if (!Array.isArray(q.choices) || q.choices.length !== 4) {
			throw new Error(`track ${q.trackCode} order ${q.order}: need 4 choices`);
		}
		if (q.correctIndex < 0 || q.correctIndex > 3) {
			throw new Error(`track ${q.trackCode} order ${q.order}: bad correctIndex`);
		}
		byTrack.set(q.trackCode, (byTrack.get(q.trackCode) || 0) + 1);
	}
	for (const [code, n] of byTrack) {
		if (n !== 5) throw new Error(`track ${code}: expected 5 questions, got ${n}`);
	}
}

const all = [];
for (const f of FILES) {
	const fp = path.join(subagentsDir, f);
	if (!fs.existsSync(fp)) {
		console.error('Missing transcript file:', fp);
		process.exit(1);
	}
	all.push(...extractLargestJsonArrayFromJsonl(fp));
}

validate(all);

const outPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');
const body = `import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev bank: 5 questions × 22 tracks; merged from agent batches. Regenerate: \`node scripts/extract-questions-from-transcripts.mjs\` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = ${JSON.stringify(all, null, '\t')};
`;
fs.writeFileSync(outPath, body, 'utf8');
console.log('Wrote', outPath, 'count=', all.length);

#!/usr/bin/env node
/**
 * Export per-track banks from src/convex/seed/devQuestionBank.ts
 * into question-gen/banks/<examSlug>.json for review/validation.
 *
 * Usage: node question-gen/export-banks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const seedPath = path.join(root, 'src', 'convex', 'seed', 'devQuestionBank.ts');
const configPath = path.join(__dirname, 'tracks.config.json');
const outDir = path.join(__dirname, 'banks');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const byCode = Object.fromEntries(config.tracks.map((t) => [t.trackCode, t]));

const raw = fs.readFileSync(seedPath, 'utf8');
const markerAt = raw.indexOf('export const DEV_PRACTICE_QUESTIONS');
const start = raw.indexOf('[', markerAt);
const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
const end = castEnd >= 0 ? castEnd : raw.lastIndexOf('];');
const questions = JSON.parse(raw.slice(start, end + 1));

fs.mkdirSync(outDir, { recursive: true });

const grouped = {};
for (const q of questions) {
	(grouped[q.trackCode] ??= []).push(q);
}

const today = new Date().toISOString().slice(0, 10);
let written = 0;
for (const [trackCode, qs] of Object.entries(grouped)) {
	const track = byCode[trackCode];
	const examSlug = track?.examSlug ?? trackCode.toLowerCase();
	const bank = {
		examSlug,
		trackCode,
		docsFamily: config.docsFamily ?? 'australia',
		generatedAt: today,
		targetCount: track?.targetCount,
		questions: qs.sort((a, b) => a.order - b.order)
	};
	fs.writeFileSync(path.join(outDir, `${examSlug}.json`), JSON.stringify(bank, null, 2) + '\n');
	written++;
}

console.log(`Exported ${written} banks to question-gen/banks/ (${questions.length} questions)`);

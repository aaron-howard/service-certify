/**
 * Lint CIS-DF questions for exam-realistic style.
 *
 * Usage: node scripts/lint-cis-df-realism.mjs [--orders=0-4]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');
const realismPath = path.join(__dirname, '..', 'src', 'lib', 'catalog', 'cisDfRealism.ts');

const ordersArg = process.argv.find((a) => a.startsWith('--orders='));
const orderFilter = ordersArg
	? (() => {
			const [start, end] = ordersArg.split('=')[1].split('-').map(Number);
			return (order) => order >= start && order <= end;
		})()
	: null;

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const marker = 'export const DEV_PRACTICE_QUESTIONS';
	const markerAt = raw.indexOf(marker);
	if (markerAt < 0) throw new Error('Could not find DEV_PRACTICE_QUESTIONS');
	const start = raw.indexOf('[', markerAt);
	const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
	const plainEnd = raw.lastIndexOf('];');
	const end = castEnd >= 0 ? castEnd : plainEnd;
	if (start < 0 || end < 0) throw new Error('Could not parse devQuestionBank.private.ts');
	return JSON.parse(raw.slice(start, end + 1));
}

const { validateCisDfTrack } = await import(pathToFileURL(realismPath).href);

const all = readBank().filter((q) => q.trackCode === 'CIS-DF');
const filtered = orderFilter ? all.filter((q) => orderFilter(q.order)) : all;
const issues = validateCisDfTrack(filtered);

if (issues.length) {
	console.error(`CIS-DF realism lint failed (${filtered.length} questions):`);
	for (const issue of issues) console.error(' -', issue);
	process.exit(1);
}

console.log(`OK: ${filtered.length} filtered questions passed CIS-DF realism lint`);

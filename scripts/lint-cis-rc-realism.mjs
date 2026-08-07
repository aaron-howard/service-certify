/**
 * Lint CIS-RC questions for exam-realistic style.
 *
 * Usage: node scripts/lint-cis-rc-realism.mjs [--orders=0-4]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');
const realismPath = path.join(__dirname, '..', 'src', 'lib', 'catalog', 'cisRcRealism.ts');

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
	if (start < 0 || end < 0) throw new Error('Could not parse devQuestionBank.ts');
	return JSON.parse(raw.slice(start, end + 1));
}

const { validateCisRcTrack } = await import(pathToFileURL(realismPath).href);

const bank = readBank();
let rows = bank.filter((q) => q.trackCode === 'CIS-RC');
if (orderFilter) rows = rows.filter((q) => orderFilter(q.order));

const issues = validateCisRcTrack(rows);

if (issues.length === 0) {
	const scope = orderFilter ? `${rows.length} filtered questions` : `${rows.length} CIS-RC questions`;
	console.log(`OK: ${scope} passed CIS-RC realism lint`);
	process.exit(0);
}

console.error(`CIS-RC realism lint failed (${issues.length} issues):`);
for (const issue of issues) console.error(`  - ${issue}`);
process.exit(1);

/**
 * Lint CIS-SP questions for exam-realistic style.
 *
 * Usage: node scripts/lint-cis-sp-realism.mjs [--orders=0-4]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');
const realismPath = path.join(__dirname, '..', 'src', 'lib', 'catalog', 'cisSpRealism.ts');

const ordersArg = process.argv.find((a) => a.startsWith('--orders='));
const orderFilter = ordersArg
	? (() => {
			const [start, end] = ordersArg.split('=')[1].split('-').map(Number);
			return (order) => order >= start && order <= end;
		})()
	: null;

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) throw new Error('Could not parse devQuestionBank.ts');
	return JSON.parse(match[1]);
}

const { validateCisSpTrack } = await import(pathToFileURL(realismPath).href);

const all = readBank().filter((q) => q.trackCode === 'CIS-SP');
const filtered = orderFilter ? all.filter((q) => orderFilter(q.order)) : all;
const issues = validateCisSpTrack(filtered);

if (issues.length) {
	console.error(`CIS-SP realism lint failed (${filtered.length} questions):`);
	for (const issue of issues) console.error(' -', issue);
	process.exit(1);
}

console.log(`OK: ${filtered.length} filtered questions passed CIS-SP realism lint`);

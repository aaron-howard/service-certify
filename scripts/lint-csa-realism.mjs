/**
 * Lint CSA questions for exam-realistic style.
 *
 * Usage: node scripts/lint-csa-realism.mjs [--orders=0-4]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');
const realismPath = path.join(__dirname, '..', 'src', 'lib', 'catalog', 'csaRealism.ts');

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

const { validateCsaTrack } = await import(pathToFileURL(realismPath).href);

const bank = readBank();
let rows = bank.filter((q) => q.trackCode === 'CSA');
if (orderFilter) rows = rows.filter((q) => orderFilter(q.order));

const issues = validateCsaTrack(rows);

if (issues.length === 0) {
	const scope = orderFilter ? `${rows.length} filtered questions` : `${rows.length} CSA questions`;
	console.log(`OK: ${scope} passed CSA realism lint`);
	process.exit(0);
}

console.error(`CSA realism lint failed (${issues.length} issues):`);
for (const issue of issues) console.error(`  - ${issue}`);
process.exit(1);

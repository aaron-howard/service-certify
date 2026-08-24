/**
 * Normalize CIS-SM sourceUrls away from /bundle/* and mid-path /australia|/vancouver forms.
 * Run after merge: node scripts/question-batches/_normalize-cis-sm-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString } from './_url-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');

function normalizeUrl(url) {
	const text = readString(url);
	if (!text || !text.includes('servicenow.com/docs')) return url;
	url = text;
	if (
		url.includes('/docs/r/') &&
		!url.includes('/australia/') &&
		!url.includes('/vancouver/') &&
		!url.includes('/bundle/')
	) {
		return url;
	}

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(/\/docs\/bundle\/[^/]+\/page\/product\/(.+)$/);
	if (bundle) {
		next = `https://www.servicenow.com/docs/r/it-operations-management/${bundle[1]}`;
	}

	return next;
}

const raw = fs.readFileSync(bankPath, 'utf8');
const marker = 'export const DEV_PRACTICE_QUESTIONS';
const markerAt = raw.indexOf(marker);
const start = raw.indexOf('[', markerAt);
const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
const singleCastEnd = raw.lastIndexOf('] as DevPracticeQuestionRow[]');
const plainEnd = raw.lastIndexOf('];');
const end = castEnd >= 0 ? castEnd : singleCastEnd >= 0 ? singleCastEnd : plainEnd;
const prefix = raw.slice(0, start);
const suffix = raw.slice(end + 1);
const bank = JSON.parse(raw.slice(start, end + 1));

let changedUrls = 0;
let changedQuestions = 0;
for (const q of bank) {
	if (q.trackCode !== 'CIS-SM' || !Array.isArray(q.sourceUrls)) continue;
	let touched = false;
	q.sourceUrls = q.sourceUrls.map((u) => {
		const next = normalizeUrl(u);
		if (next !== u) {
			changedUrls++;
			touched = true;
		}
		return next;
	});
	if (touched) changedQuestions++;
}

fs.writeFileSync(bankPath, `${prefix}${JSON.stringify(bank, null, '\t')}${suffix}`);
console.log(`CIS-SM URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

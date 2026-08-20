/**
 * Normalize CIS-PA sourceUrls away from /australia/ mid-paths and bundle/* URLs.
 * Run after merge: node scripts/question-batches/_normalize-cis-pa-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString } from './_url-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

function normalizeUrl(url) {
	const text = readString(url);
	if (!text || !text.includes('servicenow.com/docs')) return url;
	url = text;
	if (url.includes('/docs/r/') && !url.includes('/australia/') && !url.includes('/bundle/')) {
		return url;
	}

	const file = url.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (!file.endsWith('.html')) return url;

	if (url.includes('/dashboards/')) {
		return `https://www.servicenow.com/docs/r/now-intelligence/dashboards/${file}`;
	}
	if (
		url.includes('performance-analytics') ||
		url.includes('now-intelligence') ||
		url.includes('performance-analytics-and-reporting')
	) {
		return `https://www.servicenow.com/docs/r/now-intelligence/performance-analytics/${file}`;
	}
	if (url.includes('/administer/performance/') || file === 'performance-best-practices.html') {
		return `https://www.servicenow.com/docs/r/platform-administration/performance/${file}`;
	}
	if (url.includes('/navigation/') || file === 'c_NextExperienceUnifiedNavigation.html') {
		return `https://www.servicenow.com/docs/r/platform-user-interface/navigation/${file}`;
	}
	return url;
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
	if (q.trackCode !== 'CIS-PA' || !Array.isArray(q.sourceUrls)) continue;
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

const header = '/** Dev question bank; merge batches: `node scripts/extract-questions-from-transcripts.mjs --merge-batches` */\n';
const body = `${prefix}${JSON.stringify(bank, null, '\t')}${suffix}`;
const out = body.startsWith('/**') ? body : header + body.replace(/^\/\/ @ts-nocheck\n/, '// @ts-nocheck\n');
fs.writeFileSync(bankPath, raw.startsWith('// @ts-nocheck') ? `${raw.slice(0, start)}${JSON.stringify(bank, null, '\t')}${suffix}` : out);

console.log(`CIS-PA URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

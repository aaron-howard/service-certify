/**
 * Normalize CPOE sourceUrls away from mid-path /australia/ forms.
 * Run: node scripts/question-batches/_normalize-cpoe-urls.mjs
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
	if (url.includes('/docs/r/') && !url.includes('/australia/') && !url.includes('/bundle/')) {
		return url;
	}

	const file = url.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (!file.endsWith('.html')) return url;

	if (url.includes('install-and-upgrade') || file.includes('Upgrade') || file.includes('upgrade')) {
		return `https://www.servicenow.com/docs/r/platform-administration/install-and-upgrade/concept/${file}`;
	}
	if (url.includes('platform-administration')) {
		return `https://www.servicenow.com/docs/r/platform-administration/${file}`;
	}
	if (url.includes('platform-security')) {
		return `https://www.servicenow.com/docs/r/platform-security/${file}`;
	}
	if (url.includes('/impact/')) {
		return `https://www.servicenow.com/docs/r/impact/${file}`;
	}
	return url.replace('/australia/', '/');
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
	if (q.trackCode !== 'CPOE' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CPOE URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

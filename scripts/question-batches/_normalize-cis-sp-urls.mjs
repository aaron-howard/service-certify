/**
 * Normalize CIS-SP sourceUrls away from /bundle/* and mid-path /australia/ forms.
 * Run: node scripts/question-batches/_normalize-cis-sp-urls.mjs
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

	if (url.includes('flow-designer-domain') || url.includes('build-workflows')) {
		return `https://www.servicenow.com/docs/r/build-workflows/${file}`;
	}
	if (url.includes('import-sets') || file.startsWith('t_CreateATransform') || file.startsWith('c_Import') || file.startsWith('c_Coalesc') || file.startsWith('c_Transform')) {
		return `https://www.servicenow.com/docs/r/integrate-applications/system-import-sets/${file}`;
	}
	if (url.includes('data-management') || file === 'c_DataManagement.html') {
		return `https://www.servicenow.com/docs/r/platform-administration/data-management/${file}`;
	}
	if (url.includes('update-sets') || file === 'update-sets.html') {
		return `https://www.servicenow.com/docs/r/platform-administration/update-sets/${file}`;
	}
	if (
		url.includes('domain-separation') ||
		url.includes('company-and-domain') ||
		url.includes('platform-security') ||
		file.startsWith('bp-') ||
		file.startsWith('c_Domain') ||
		file.startsWith('domain-') ||
		file === 'process-separation.html' ||
		file === 'domain-separation.html' ||
		file === 'plan-domain-separation-implementation.html' ||
		file === 't_ChangeDomainVisibility.html'
	) {
		return `https://www.servicenow.com/docs/r/platform-security/${file}`;
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
	if (q.trackCode !== 'CIS-SP' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-SP URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

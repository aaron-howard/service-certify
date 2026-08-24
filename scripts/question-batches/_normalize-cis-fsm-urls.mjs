/**
 * Normalize CIS-FSM sourceUrls: remap missing filenames to Australia topics.
 *
 * Run after merge: node scripts/question-batches/_normalize-cis-fsm-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString } from './_url-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');

/** basename → path under /docs/r/field-service-management/ */
const FILE_PATH = {
	'create-work-orders.html': 'work-order-management/t_CreateAWorkOrder.html',
	'survey-based-questionnaires.html':
		'work-order-management/create-questionnaire-for-work-order.html',
	't_CreateAWorkOrder.html': 'work-order-management/t_CreateAWorkOrder.html',
	'create-questionnaire-for-work-order.html':
		'work-order-management/create-questionnaire-for-work-order.html',
	'smart-assessment-questionnaire.html': 'smart-assessment-questionnaire.html',
	'customer-experience-components.html': 'customer-experience-components.html',
	'dispatch-map-in-dispatcher-workspace.html':
		'field-service-scheduling/dispatch-map-in-dispatcher-workspace.html'
};

function normalizeUrl(url) {
	const text = readString(url);
	if (!text || !text.includes('servicenow.com/docs')) return url;
	url = text;

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(
		/\/docs\/bundle\/[^/]+\/page\/product\/(?:field-service-management|mobile-platform)\/(?:concept|task|reference)\/(.+)$/
	);
	if (bundle) {
		const file = bundle[1];
		const mapped = FILE_PATH[file] || file;
		next = `https://www.servicenow.com/docs/r/field-service-management/${mapped}`;
		return next;
	}

	const file = next.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (FILE_PATH[file] && next.includes('/field-service-management/')) {
		// Replace trailing path segment(s) with mapped path
		next = `https://www.servicenow.com/docs/r/field-service-management/${FILE_PATH[file]}`;
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
	if (q.trackCode !== 'CIS-FSM' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-FSM URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

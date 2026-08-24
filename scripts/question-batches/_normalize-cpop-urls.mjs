/**
 * Normalize CPOP sourceUrls away from /bundle/* and mid-path /australia/ forms.
 * Run: node scripts/question-batches/_normalize-cpop-urls.mjs
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

	if (url.includes('common-service-data-model') || url.includes('csdm-')) {
		return `https://www.servicenow.com/docs/r/servicenow-platform/common-service-data-model-csdm/${file}`;
	}
	if (url.includes('cloud-governance') || file === 'cloud-governance-suite.html') {
		return `https://www.servicenow.com/docs/r/cloud-governance-suite/${file}`;
	}
	if (url.includes('/impact/') || file === 'impact.html' || file.includes('strategic-planning')) {
		return `https://www.servicenow.com/docs/r/impact/${file}`;
	}
	if (url.includes('performance-analytics') || file.startsWith('c_Performance')) {
		return `https://www.servicenow.com/docs/r/now-intelligence/performance-analytics/${file}`;
	}
	if (url.includes('/reporting/')) {
		return `https://www.servicenow.com/docs/r/now-intelligence/reporting/${file}`;
	}
	if (url.includes('domain-separation') || file === 'domain-separation.html') {
		return `https://www.servicenow.com/docs/r/platform-security/${file}`;
	}
	if (url.includes('upgrade') || file.includes('skipped-update') || file.includes('upgrade-')) {
		return `https://www.servicenow.com/docs/r/platform-administration/upgrade-center/${file}`;
	}
	if (url.includes('instance-clone') || file.includes('clone')) {
		return `https://www.servicenow.com/docs/r/platform-administration/instance-clone/${file}`;
	}
	if (url.includes('table-administration') || file.includes('TableRotation')) {
		return `https://www.servicenow.com/docs/r/platform-administration/table-administration/${file}`;
	}
	if (url.includes('instance-administration') || file === 'platform-governance.html') {
		return `https://www.servicenow.com/docs/r/platform-administration/instance-administration/${file}`;
	}
	if (url.includes('now-platform') || file === 'c_NowPlatform.html') {
		return `https://www.servicenow.com/docs/r/servicenow-platform/now-platform/${file}`;
	}
	if (url.includes('monitoring') || file.includes('monitoring')) {
		return `https://www.servicenow.com/docs/r/servicenow-platform/monitoring/${file}`;
	}
	if (url.includes('human-resources') || url.includes('hr-service')) {
		return `https://www.servicenow.com/docs/r/employee-service-management/${file}`;
	}
	if (url.includes('change-management')) {
		return `https://www.servicenow.com/docs/r/it-service-management/change-management/${file}`;
	}
	if (url.includes('cmdb') || file.includes('IdentificationAndReconciliation')) {
		return `https://www.servicenow.com/docs/r/configuration-management/cmdb/${file}`;
	}
	if (url.includes('platform-administration')) {
		return `https://www.servicenow.com/docs/r/platform-administration/${file}`;
	}
	if (url.includes('platform-security')) {
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
	if (q.trackCode !== 'CPOP' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CPOP URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

/**
 * Normalize CIS-SAM sourceUrls to /docs/r/it-asset-management/software-asset-management/
 * and remap stale filenames to Australia-local topics.
 *
 * Run after merge: node scripts/question-batches/_normalize-cis-sam-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString } from './_url-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');

const FILE_REMAP = {
	'sam-roles.html': 'sam-installed-components.html',
	'reconcile-software-entitlements.html': 'c_SAMReconciliation.html',
	'license-workbench.html': 'sam-license-workbench.html',
	'manage-software-entitlements.html': 'track-software-rights.html',
	'subscription-entitlements.html': 'sam-subscription.html',
	'entitlement-audit-preparation.html': 'software-reconciliation-results.html',
	'software-asset-management-overview.html': 'c_SAMOverview.html',
	'software-reclamation.html': 'reclaiming-software-sam.html',
	'validate-reconciliation-results.html': 'software-reconciliation-results.html',
	'software-model-normalization-governance.html': 'sam-normalization.html',
	'software-model-data-quality-kpis.html': 'sam-normalization-dash.html',
	'configure-license-metrics.html': 'c_SAMLicenseMetrics.html',
	'software-entitlement-best-practices.html': 'software-entitlement-fields.html',
	'import-software-entitlements.html': 'import-entitlements-workspace.html',
	'map-discovered-software.html': 'manual-normalize-swmodel-workspace.html',
	'create-a-software-model.html': 'software-models-and-entitlements.html',
	'software-entitlements-overview.html': 'software-models-and-entitlements.html',
	'software-normalization-rules.html': 'normalization-status.html',
	'sam-process-overview.html': 'c_SAMOverview.html',
	'software-compliance-overview.html': 'c_SAMReconciliation.html',
	'c_Roles.html': 'sam-installed-components.html'
};

function normalizeUrl(url) {
	const text = readString(url);
	if (!text || !text.includes('servicenow.com/docs')) return url;
	url = text;

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(/\/docs\/bundle\/[^/]+\/page\/product\/(?:software-asset-management2?|software-asset-management)\/(?:concept|task|reference)\/(.+)$/);
	if (bundle) {
		next = `https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/${bundle[1]}`;
	}

	// Collapse alternate SAM product path prefixes into the ITAM SAM tree
	next = next.replace(
		/\/docs\/r\/software-asset-management\/(?:software-asset-management|software-entitlement-management|software-model-management)\//g,
		'/docs/r/it-asset-management/software-asset-management/'
	);

	const file = next.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (FILE_REMAP[file]) {
		next = next.replace(file, FILE_REMAP[file]);
	}

	// Ensure final SAM citations live under it-asset-management/software-asset-management
	if (
		next.includes('servicenow.com/docs/r/') &&
		file.endsWith('.html') &&
		!next.includes('/it-asset-management/software-asset-management/') &&
		!next.includes('/it-asset-management/now-assist-for-software-asset-management-sam/') &&
		!next.includes('/it-asset-management/saas-license-management/') &&
		(next.includes('software-asset') || FILE_REMAP[file])
	) {
		const remapped = FILE_REMAP[file] || file;
		next = `https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/${remapped}`;
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
	if (q.trackCode !== 'CIS-SAM' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-SAM URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

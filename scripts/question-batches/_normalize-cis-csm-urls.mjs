/**
 * Normalize CIS-CSM sourceUrls: remap invented *-for-csm filenames to Australia topics.
 *
 * Run after merge: node scripts/question-batches/_normalize-cis-csm-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString } from './_url-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

/** basename → path under /docs/r/ (may include publication prefix) */
const FILE_PATH = {
	'advanced-work-assignment-for-csm.html':
		'customer-service-management/configure-advanced-work-assignment-route-email-interactions.html',
	'service-channels-for-csm.html':
		'customer-service-management/view-service-channel-configured-email-interaction.html',
	'awa-queues-for-csm.html': 'customer-service-management/config-awa-queue-for-proxy-contact.html',
	'skill-based-routing-for-csm.html':
		'customer-service-management/configure-mandatory-skills-feature.html',
	'customer-service-management-data-model.html':
		'customer-service-management/activate-customer-data-models-b2b2c.html',
	'openframe-for-csm.html': 'customer-service-management/c_OpenFrameOverview.html',
	'targeted-communications-for-csm.html':
		'customer-service-management/c_TargetedCommunications.html',
	'service-level-agreements-for-csm.html':
		'customer-service-management/t_DefineSLAForCustServiceCase.html',
	'special-handling-notes-for-csm.html':
		'customer-service-management/configure-special-handling-notes.html',
	'case-management-process.html': 'customer-service-management/configure-csm-case-management.html',
	'major-issue-management-for-csm.html':
		'customer-service-management/major-issue-management-application.html',
	'case-escalation-for-csm.html': 'customer-service-management/case-escalation-components.html',
	'case-tasks-for-csm.html': 'customer-service-management/csm-case-task-form.html',
	'case-digest-for-csm.html': 'customer-service-management/activate-case-digests.html',
	'entitlements-for-csm.html': 'customer-service-management/configure-csm-entitlements.html',
	'knowledge-management-for-csm.html':
		'servicenow-platform/knowledge-management/knowledge-article-quality-index.html',
	'csm-configurable-workspace.html':
		'customer-service-management/exploring-configurable-workspace.html',
	'guided-decisions-for-csm.html': 'customer-service-management/use-guided-decisions.html',
	'customer-service-portal.html': 'customer-service-management/use-the-customer-portal.html',
	'service-catalog-for-csm.html':
		'customer-service-management/service-catalog-request-integration.html',
	'performance-analytics-for-csm.html':
		'customer-service-management/analytics-and-reporting-solutions-for-customer-service/analytics-reporting-csm.html',
	'reporting-for-csm.html':
		'customer-service-management/analytics-and-reporting-solutions-for-customer-service/analytics-reporting-csm.html',
	'customer-service-management-implementation.html':
		'customer-service-management/exploring-csm.html',
	'self-service-for-csm.html': 'customer-service-management/self-service-options-csm-customers.html',
	'now-assist-for-csm.html':
		'customer-service-management/now-assist-for-csm/activate-now-assist-for-customer-service-management-csm.html',
	'article-quality-index.html':
		'servicenow-platform/knowledge-management/knowledge-article-quality-index.html',
	'knowledge-centered-service.html':
		'servicenow-platform/knowledge-management/activate-kcs-capabilties-plugin.html',
	'knowledge-management-workflows.html':
		'servicenow-platform/knowledge-management/r_KnowledgeWorkflows.html',
	'c_OnScreenAlerts.html': 'customer-service-management/c_OnScreenAlerts.html',
	'configure-install-base.html': 'customer-service-management/configure-install-base.html',
	'configure-csm-products.html': 'customer-service-management/configure-csm-products.html',
	'configure-special-handling-notes.html':
		'customer-service-management/configure-special-handling-notes.html',
	'manage-special-handling-notes.html':
		'customer-service-management/manage-special-handling-notes.html'
};

function normalizeUrl(url) {
	const text = readString(url);
	if (!text || !text.includes('servicenow.com/docs')) return url;
	url = text;

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(
		/\/docs\/bundle\/[^/]+\/page\/product\/(?:customer-service-management|knowledge-management)\/(?:concept|task|reference)\/(.+)$/
	);
	if (bundle) {
		const file = bundle[1];
		const mapped = FILE_PATH[file] || `customer-service-management/${file}`;
		next = `https://www.servicenow.com/docs/r/${mapped}`;
		return next;
	}

	// Top-level knowledge-management → platform KM tree
	next = next.replace(
		/\/docs\/r\/knowledge-management\//g,
		'/docs/r/servicenow-platform/knowledge-management/'
	);

	const file = next.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (FILE_PATH[file]) {
		next = `https://www.servicenow.com/docs/r/${FILE_PATH[file]}`;
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
	if (q.trackCode !== 'CIS-CSM' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-CSM URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

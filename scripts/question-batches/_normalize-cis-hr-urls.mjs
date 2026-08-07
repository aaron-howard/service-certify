/**
 * Normalize CIS-HR sourceUrls from phantom human-resources/employee-center pubs
 * into employee-service-management Australia topics.
 *
 * Run after merge: node scripts/question-batches/_normalize-cis-hr-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

/** basename → path under /docs/r/employee-service-management/ */
const FILE_PATH = {
	'hrsd-implementation-governance.html':
		'hr-service-delivery/hr-piwb-implementation-guidance.html',
	'lifecycle-events-overview.html': 'lifecycle-events/using-lifecycle-events.html',
	'hr-services-overview.html': 'hr-service-delivery/hr-service-delivery-overview.html',
	'hr-case-management.html':
		'agent-workspace-for-hr-case-management/agent-ws-hr-case-mgmt-exploring.html',
	'hr-case-security.html': 'hr-service-delivery/hr-security.html',
	'hr-criteria.html': 'hr-service-delivery/hr-criteria.html',
	'hr-centers-of-excellence.html': 'hr-service-delivery/hr-centers-of-excellence-coes.html',
	'employee-center-overview.html':
		'employee-experience-foundation/employee-center-landing-page.html',
	'hrsd-reporting-and-analytics.html': 'hr-service-delivery/c_HRDashboardsReports.html',
	'hr-case-routing.html': 'hr-service-delivery/hr-case-assignment.html',
	'hr-knowledge-management.html': 'hr-service-delivery/hr-knowledge-management.html',
	'hr-profile-management.html': 'hr-service-delivery/c_HRProfileSecurity.html',
	'hr-case-templates.html': 'hr-service-delivery/configure-hr-case-template.html',
	'document-management-for-hr.html': 'hr-service-delivery/document-templates-overview.html',
	'employee-document-management.html':
		'employee-document-management/exploring-employee-document-management.html',
	'hr-approvals.html': 'hr-service-delivery/t_ApproveAnHRCase.html',
	'c_HRDashboardsReports.html': 'hr-service-delivery/c_HRDashboardsReports.html',
	'using-lifecycle-events.html': 'lifecycle-events/using-lifecycle-events.html',
	'hr-lifecycle-event-configuration.html':
		'lifecycle-events/hr-lifecycle-event-configuration.html',
	'configure-hr-lifecycle-event-activity-set.html':
		'lifecycle-events/configure-hr-lifecycle-event-activity-set.html',
	'hr-piwb-implementation-guidance.html':
		'hr-service-delivery/hr-piwb-implementation-guidance.html',
	'activate-case-and-knowledge-management-scoped.html':
		'hr-service-delivery/activate-case-and-knowledge-management-scoped.html',
	'hr-service-delivery-overview.html': 'hr-service-delivery/hr-service-delivery-overview.html',
	'hr-centers-of-excellence-coes.html': 'hr-service-delivery/hr-centers-of-excellence-coes.html',
	'hr-security.html': 'hr-service-delivery/hr-security.html',
	'employee-center-landing-page.html':
		'employee-experience-foundation/employee-center-landing-page.html',
	'configuring-employee-center-pro.html':
		'employee-experience-foundation/configuring-employee-center-pro.html'
};

function normalizeUrl(url) {
	if (typeof url !== 'string' || !url.includes('servicenow.com/docs')) return url;

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(
		/\/docs\/bundle\/[^/]+\/page\/product\/(?:human-resources|employee-center|employee-service-management|hr-service-delivery)\/(?:concept|task|reference)\/(.+)$/
	);
	if (bundle) {
		const file = bundle[1];
		const mapped = FILE_PATH[file] || `hr-service-delivery/${file}`;
		next = `https://www.servicenow.com/docs/r/employee-service-management/${mapped}`;
		return next;
	}

	// Phantom top-level pubs → ESM
	next = next.replace(
		/\/docs\/r\/human-resources\/hr-service-delivery\//g,
		'/docs/r/employee-service-management/hr-service-delivery/'
	);
	next = next.replace(
		/\/docs\/r\/employee-center\//g,
		'/docs/r/employee-service-management/employee-experience-foundation/'
	);

	const file = next.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (FILE_PATH[file]) {
		next = `https://www.servicenow.com/docs/r/employee-service-management/${FILE_PATH[file]}`;
	}

	return next;
}

const raw = fs.readFileSync(bankPath, 'utf8');
const marker = 'export const DEV_PRACTICE_QUESTIONS';
const markerAt = raw.indexOf(marker);
const start = raw.indexOf('[', markerAt);
const castEnd = raw.lastIndexOf('] as unknown as DevPracticeQuestionRow[]');
const plainEnd = raw.lastIndexOf('];');
const end = castEnd >= 0 ? castEnd : plainEnd;
const prefix = raw.slice(0, start);
const suffix = raw.slice(end + 1);
const bank = JSON.parse(raw.slice(start, end + 1));

let changedUrls = 0;
let changedQuestions = 0;
for (const q of bank) {
	if (q.trackCode !== 'CIS-HR' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-HR URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

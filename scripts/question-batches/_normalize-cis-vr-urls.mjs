/**
 * Normalize CIS-VR sourceUrls under security-management and remap invented filenames.
 *
 * Run after merge: node scripts/question-batches/_normalize-cis-vr-urls.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');

/** basename → path under /docs/r/security-management/ */
const FILE_PATH = {
	'vulnerability-calculators.html': 'vulnerability-response/vuln-calculators-rules.html',
	'vulnerability-manager-workspace.html':
		'vulnerability-manager-workspace/vulnerability-manager-workspace-landing-page.html',
	'remediation-workflows.html': 'vulnerability-response/vulnerabillity-states.html',
	'it-remediation-workspace.html':
		'it-remediation-workspace/it-remediation-workspace-landing-page.html',
	'assignment-rules.html': 'sem-configure-assignment-rules.html',
	'remediation-task-rules.html': 'sem-configure-remediation-task-rules.html',
	'remediation-target-rules.html': 'sem-configure-remediation-target-rules.html',
	'classification-rules.html': 'sem-configure-classification-rules.html',
	'vulnerability-exceptions.html': 'vulnerability-response/vr-exception-management.html',
	'exception-rules.html': 'sem-exception-rules-overview.html',
	'close-out-remediation.html': 'vulnerability-response/vulnerabillity-states.html',
	'false-positive-management.html': 'it-remediation-workspace/vr-ws-mark-fp.html',
	'vr-dashboards.html': 'vulnerability-manager-workspace/vr-ws-dashboards.html',
	'vr-performance-analytics.html': 'vulnerability-response/vulnerability-mgmnt-pa-dashboard.html',
	'vr-reporting.html': 'vulnerability-response/vulnerability-mgmnt-pa-dashboard.html',
	'ciso-dashboards.html': 'vulnerability-response/vulnerability-mgmnt-CISO-dashboard.html',
	'c_BestPractisesIntegrations.html': 'c_BestPractisesIntegrations.html',
	'vr-persona-overview.html': 'vulnerability-response/vr-persona-overview.html',
	'install-and-configure-r7.html': 'vulnerability-response/install-and-configure-r7.html',
	'qualys-prerequisites.html': 'vulnerability-response/qualys-prerequisites.html',
	'nvd-vuln-integration.html': 'vulnerability-response/nvd-vuln-integration.html',
	'c_VulnerabilityResponse.html': 'vulnerability-response/c_VulnerabilityResponse.html',
	'mstvm-integration.html': 'vulnerability-response/mstvm-integration.html',
	'tenableIntegration.html': 'vulnerability-response/tenableIntegration.html',
	'reapply-reconcile-unmatched-discovered-items.html':
		'vulnerability-response/reapply-reconcile-unmatched-discovered-items.html',
	'vr-setup-autoclose-detections.html': 'vulnerability-response/vr-setup-autoclose-detections.html',
	'vuln-calculators-rules.html': 'vulnerability-response/vuln-calculators-rules.html',
	'vr-exception-management.html': 'vulnerability-response/vr-exception-management.html',
	'vulnerability-groups.html': 'vulnerability-response/vulnerability-groups.html',
	'sem-configure-remediation-task-rules.html': 'sem-configure-remediation-task-rules.html',
	'sem-configure-assignment-rules.html': 'sem-configure-assignment-rules.html',
	'sem-configure-classification-rules.html': 'sem-configure-classification-rules.html',
	'sem-configure-remediation-target-rules.html': 'sem-configure-remediation-target-rules.html',
	'sem-exception-rules-overview.html': 'sem-exception-rules-overview.html',
	'avr-landing.html': 'application-vulnerability-response/avr-landing.html',
	'cvr-landing.html': 'container-vulnerability-response/cvr-landing.html',
	'it-remediation-workspace-landing-page.html':
		'it-remediation-workspace/it-remediation-workspace-landing-page.html',
	'vr-ws-request-exception.html': 'it-remediation-workspace/vr-ws-request-exception.html',
	'vr-ws-mark-fp.html': 'it-remediation-workspace/vr-ws-mark-fp.html',
	'vulnerability-manager-workspace-landing-page.html':
		'vulnerability-manager-workspace/vulnerability-manager-workspace-landing-page.html',
	'vr-ws-wtopic-related-items-v18.html':
		'vulnerability-manager-workspace/vr-ws-wtopic-related-items-v18.html',
	'vr-ws-dashboards.html': 'vulnerability-manager-workspace/vr-ws-dashboards.html',
	'vulnerability-mgmnt-CISO-dashboard.html':
		'vulnerability-response/vulnerability-mgmnt-CISO-dashboard.html',
	'vulnerability-mgmnt-pa-dashboard.html':
		'vulnerability-response/vulnerability-mgmnt-pa-dashboard.html',
	'vulnerabillity-states.html': 'vulnerability-response/vulnerabillity-states.html',
	'qualys-config-in-SA.html': 'vulnerability-response/qualys-config-in-SA.html'
};

function normalizeUrl(url) {
	if (typeof url !== 'string' || !url.includes('servicenow.com/docs')) return url;

	let next = url.replace(/\/(australia|vancouver)\//g, '/');

	const bundle = next.match(
		/\/docs\/bundle\/[^/]+\/page\/product\/(?:vulnerability-response|security-operations|security-management)\/(?:concept|task|reference)\/(.+)$/
	);
	if (bundle) {
		const file = bundle[1];
		const mapped = FILE_PATH[file] || `vulnerability-response/${file}`;
		next = `https://www.servicenow.com/docs/r/security-management/${mapped}`;
		return next;
	}

	// Top-level phantom pub → security-management
	next = next.replace(
		/\/docs\/r\/vulnerability-response\//g,
		'/docs/r/security-management/vulnerability-response/'
	);

	const file = next.split('/').pop()?.replace(/[#?].*$/, '') || '';
	if (FILE_PATH[file]) {
		next = `https://www.servicenow.com/docs/r/security-management/${FILE_PATH[file]}`;
	} else if (
		next.includes('/docs/r/security-management/vulnerability-response/') &&
		!next.includes('/application-vulnerability-response/') &&
		!next.includes('/container-vulnerability-response/')
	) {
		// leave known good VR subpaths alone
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
	if (q.trackCode !== 'CIS-VR' || !Array.isArray(q.sourceUrls)) continue;
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
console.log(`CIS-VR URL normalize: ${changedQuestions} questions, ${changedUrls} urls rewritten`);

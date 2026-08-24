/**
 * Tag CIS-SPM domain fields on the live seed bank from order quotas.
 * Run: node scripts/tag-cis-spm-domains.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.private.ts');

export function domainForOrder(order) {
	if (order <= 1) return 'SPM Implementation Overview';
	if (order <= 10) return 'SPM Financials';
	if (order <= 31) return 'Resource Management';
	if (order <= 47) return 'Idea and Demand';
	if (order <= 73) return 'Project Management';
	if (order <= 78) return 'Timecard Management';
	if (order <= 85) return 'Portfolio Planning Workspace';
	if (order <= 87) return 'SPM Platform Analytics and Dashboards';
	return 'SPM Better Together';
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

let tagged = 0;
for (const q of bank) {
	if (q.trackCode !== 'CIS-SPM') continue;
	const next = domainForOrder(q.order);
	if (q.domain !== next) {
		q.domain = next;
		tagged++;
	}
}

fs.writeFileSync(bankPath, `${prefix}${JSON.stringify(bank, null, '\t')}${suffix}`);
console.log(`CIS-SPM domain tags updated on ${tagged} questions`);

/**
 * Pad shortest distractors when the correct choice is the longest option.
 * Uses unique contextual clauses — never the shared rebalance boilerplate suffixes.
 *
 * Usage: node scripts/balance-choice-lengths.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, '..', 'src', 'convex', 'seed', 'devQuestionBank.ts');
const dryRun = process.argv.includes('--dry-run');
const TARGET_RATE = 0.85;

const BOILERPLATE_SUFFIXES = [
	' without validating scope, credentials, or operational prerequisites',
	' while bypassing standard governance controls and increasing operational risk',
	' regardless of reconciliation, security policy, or instance readiness requirements',
	' even when prerequisite data quality and ownership are not confirmed'
];

/** Unique contextual continuations (no shared boilerplate). */
const CLAUSE_POOL = [
	' across development, test, and production instances.',
	' in coordination with process owners and CAB delegates.',
	' before promoting configuration through the update set pipeline.',
	' using scoped application filters and domain separation.',
	' aligned with the affected service lifecycle and ownership model.',
	' after validating data quality in the staging environment.',
	' with audit evidence retained for compliance review cycles.',
	' scoped to the appropriate business application and module.',
	' following the standard change advisory workflow.',
	' while honoring role-based access and least-privilege design.',
	' integrated with existing CMDB relationship and dependency data.',
	' using established naming conventions and update set hygiene.',
	' coordinated with the platform center of excellence team.',
	' within the boundaries of the scoped application namespace.',
	' after confirming prerequisite tables and ACLs are in place.',
	' mapped to the correct service offering and fulfillment flow.',
	' with rollback planning documented in the change record.',
	' consistent with the instance data separation strategy.',
	' tracked through the standard defect and enhancement backlog.',
	' reviewed against the platform architecture standards guide.',
	' synchronized with discovery credentials and schedule windows.',
	' configured through the appropriate guided setup experience.',
	' validated against baseline KPIs before go-live approval.',
	' linked to the correct assignment group and escalation path.',
	' maintained through automated health checks and monitoring.',
	' documented in the runbook for operational handoff.',
	' applied only after stakeholder sign-off on the design.',
	' tested in a subproduction clone with representative data.',
	' governed by the release calendar and blackout periods.',
	' routed through the service catalog request workflow.',
	' measured against SLA targets and operational dashboards.',
	' enforced through data policies and reference qualifiers.',
	' packaged for deployment via scoped application repository.',
	' reconciled with source-of-truth records on a defined cadence.',
	' prioritized using risk scoring and impact assessment criteria.',
	' segmented by location, company, or cost center as required.',
	' onboarded through the standard integration framework pattern.',
	' decommissioned using the established retirement checklist.',
	' correlated with event management rules and alert policies.',
	' normalized using import set transform maps and coalesce keys.',
	' exposed through controlled API endpoints with OAuth scopes.',
	' cataloged with accurate category, model, and support tier metadata.',
	' escalated according to the major incident communication plan.',
	' retired when superseded by the approved replacement capability.',
	' inherited from the parent business service where applicable.',
	' audited quarterly for configuration drift and orphan records.',
	' versioned alongside the application release train milestones.',
	' attributed to the responsible product owner and process manager.',
	' refreshed on the schedule defined in the data stewardship charter.',
	' excluded from automation until acceptance criteria are met.',
	' consolidated into a single pane using performance analytics.',
	' delegated to the appropriate fulfillment group by category rules.',
	' triaged using priority matrices tied to business impact.',
	' enriched with discovery patterns and classification probes.',
	' bound to the correct contract line and entitlement records.',
	' propagated through mid-server clusters for load distribution.',
	' throttled during maintenance windows to protect stability.',
	' archived per retention policy after closure and verification.',
	' compared against peer benchmarks in the analytics workspace.',
	' activated only when dependency health checks succeed.',
	' translated into actionable tasks for implementation teams.',
	' cross-referenced with vendor knowledge and known error articles.',
	' sequenced after foundational platform services are stable.',
	' tagged for reporting in the executive dashboard suite.',
	' isolated to prevent cross-tenant data exposure risks.',
	' certified through the platform quality gate checklist.',
	' handed off with training materials for support analysts.',
	' tuned using feedback from pilot user acceptance sessions.',
	' extended through custom UI pages within scoped boundaries.',
	' mirrored into the disaster recovery standby instance.',
	' compared with historical trends to detect anomalies early.',
	' authorized through delegated developer and admin roles only.',
	' published to the service portal with audience restrictions.',
	' evaluated against total cost of ownership and effort estimates.',
	' sequenced in the transformation roadmap dependency graph.',
	' instrumented with transaction logs for forensic analysis.',
	' paired with complementary controls from the security team.',
	' benchmarked during performance test cycles before rollout.',
	' reconciled after each major upgrade or patch cycle completes.',
	' scoped to the vendor contract renewal evaluation window.',
	' distributed using update sets merged in dependency order.',
	' announced through the standard stakeholder comms template.',
	' verified with sample transactions in the QA tenant first.',
	' cataloged in the integration registry with owner contact info.',
	' weighted by criticality when competing for the same resource pool.',
	' surfaced in the agent workspace with contextual recommendations.',
	' constrained by field-level security and masked display rules.',
	' promoted after successful completion of regression test suites.',
	' aligned to the ITIL practice model adopted by the organization.',
	' decomposed into epics and stories on the agile backlog board.',
	' traced from business requirement through deployed configuration.',
	' harmonized with federated identity provider group mappings.',
	' inspected during periodic access certification campaigns.',
	' staged behind feature flags for controlled enablement.',
	' correlated to problem records when recurrence thresholds trigger.',
	' exported for offline analysis using scheduled report jobs.',
	' ingested through secure mid-server connectivity channels.',
	' rationalized during annual application portfolio reviews.',
	' substituted only when the primary path is unavailable.',
	' calibrated using operational metrics from the prior quarter.',
	' nested under the correct process module navigation path.',
	' prefaced with knowledge articles linked to common resolutions.',
	' constrained to business hours unless emergency criteria apply.',
	' funneled into continuous improvement initiatives when trends emerge.',
	' preserved as evidence attachments on the governing record.',
	' differentiated by audience type on the self-service portal.',
	' sequenced behind prerequisite data migration activities.',
	' brokered through the enterprise service bus where required.',
	' annotated with implementation notes for future maintainers.',
	' shielded from direct edits in production without approval.',
	' replicated to satellite instances on the defined sync interval.',
	' challenged during design authority review sessions.',
	' folded into the standard onboarding checklist for new teams.',
	' expressed as declarative configuration rather than custom code.',
	' triaged alongside vendor incidents in unified command views.',
	' retired from the menu when the capability is deprecated.',
	' partitioned so each region can operate independently if needed.',
	' inspected using health scan recommendations from the platform.',
	' bundled with training labs for hands-on validation exercises.',
	' negotiated as part of the statement of work deliverables.',
	' sequenced to minimize disruption to peak transaction volumes.',
	' referenced in the solution definition document baseline.',
	' overridden only through documented exception approval.',
	' propagated to downstream consumers via event subscriptions.',
	' consolidated when duplicate capabilities create user confusion.',
	' visualized on topology maps for impact analysis sessions.',
	' prefetched during login to reduce perceived latency.',
	' sandboxed until security sign-off on integration endpoints.',
	' indexed for global search with appropriate security filters.',
	' retired from automation rules when the trigger condition changes.',
	' compared with vendor best-practice reference architectures.',
	' sequenced after master data harmonization completes successfully.',
	' expressed in the configuration management baseline register.',
	' monitored through synthetic transactions every fifteen minutes.',
	' escalated to vendor support when platform limits are encountered.',
	' translated into localized labels for multilingual deployments.',
	' bounded by transaction quotas defined in the integration contract.',
	' rehearsed during tabletop exercises for resilience validation.',
	' attributed in chargeback reports to consuming departments.',
	' prefaced with impact statements for executive decision briefings.',
	' isolated in a dedicated update set per feature increment.',
	' verified against the approved requirements traceability matrix.',
	' published with version notes in the internal release bulletin.',
	' constrained to read-only access for auditors and reviewers.',
	' refreshed automatically when upstream reference data changes.',
	' nominated for sunsetting when utilization falls below threshold.',
	' orchestrated through flow designer with subflow reuse patterns.',
	' anchored to the authoritative configuration item record.',
	' sequenced within the same sprint as dependent UI changes.',
	' challenged when KPIs show no measurable improvement post-change.',
	' expressed as reusable snippets in the scoped application.',
	' correlated with employee lifecycle events from HR systems.',
	' prefaced with dependency checks against upstream providers.',
	' distributed to edge locations through mid-server selection rules.',
	' retired from scheduled jobs when batch windows are consolidated.',
	' compared with regulatory control objectives during audits.',
	' sequenced after firewall rules allow required connectivity.',
	' documented in the operational level agreement appendix.',
	' constrained by concurrent session limits on shared service accounts.',
	' propagated through clone-preservation scripts during refreshes.',
	' validated using representative personas in journey test scripts.',
	' expressed through decision tables for maintainable branching logic.',
	' correlated with supplier performance scorecards quarterly.',
	' prefaced with rollback scripts stored alongside deployment packages.',
	' distributed using content delivery rules for geo proximity.',
	' retired when superseded by the next-generation integration pattern.',
	' compared against capacity forecasts before expansion approval.',
	' sequenced behind certificate renewal on connected endpoints.',
	' documented in the configuration item relationship diagram.',
	' constrained by data residency requirements for the region.',
	' propagated to analytics cubes on the nightly ETL schedule.',
	' validated through peer review in the change implementation plan.',
	' expressed as infrastructure-as-code templates where applicable.',
	' correlated with customer satisfaction survey response trends.',
	' prefaced with stakeholder RACI assignments in the charter.',
	' distributed through approved software entitlement channels only.',
	' retired from the catalog when the vendor end-of-life date passes.',
	' compared with industry benchmarks in quarterly business reviews.',
	' sequenced after user provisioning workflows are regression tested.',
	' documented in the knowledge base with effective-date metadata.',
	' constrained by segregation-of-duties rules in approval chains.',
	' propagated via webhook notifications to subscribed systems.',
	' validated using chaos experiments in the pre-production lab.',
	' expressed through UI policies rather than client-side scripts.',
	' correlated with asset disposal workflows and chain-of-custody logs.',
	' prefaced with data classification labels on exported files.',
	' distributed to mobile clients through offline-enabled packages.',
	' retired when monitoring shows zero invocations over ninety days.',
	' compared with technical debt register items during prioritization.',
	' sequenced after backup restoration drills confirm recoverability.',
	' documented in the service design package for new offerings.',
	' constrained by API rate limits negotiated with integration partners.',
	' propagated through event-driven architecture topics and subscriptions.',
	' validated against accessibility standards before portal publication.',
	' expressed as metric definitions in the performance analytics library.',
	' correlated with procurement approval thresholds and spend categories.',
	' prefaced with threat modeling outcomes from security review.',
	' distributed using blue-green deployment across paired nodes.',
	' retired when duplicate records are merged during data cleansing.',
	' compared with forecasted demand in the capacity management plan.',
	' sequenced after identity federation cutover is verified stable.',
	' documented in the operational run cost model spreadsheet.',
	' constrained by privacy impact assessment recommendations.',
	' propagated to data warehouse landing zones on schedule.',
	' validated through contract acceptance testing with the business.',
	' expressed via notification templates localized per region.',
	' correlated with maintenance contract entitlements and response times.',
	' prefaced with executive sponsor approval on the project charter.',
	' distributed through the vendor marketplace submission pipeline.',
	' retired when regulatory guidance mandates a replacement control.',
	' compared with service heatmaps highlighting concentration risk.',
	' sequenced after network segmentation rules are updated.',
	' documented in the continuity plan attachment for the service.',
	' constrained by export control classifications on shared data sets.',
	' propagated through robotic automation queues with SLA timers.',
	' validated using golden transaction sets in automated pipelines.',
	' expressed as guard rails in the guided application creator.',
	' correlated with environmental sustainability reporting metrics.',
	' prefaced with legal review for terms affecting external parties.',
	' distributed via encrypted channels with key rotation policies.',
	' retired when architectural standards deprecate the pattern.',
	' compared with mean-time-to-restore targets after incidents.',
	' sequenced after observability dashboards cover new components.',
	' documented in the playbook for merger and acquisition integrations.',
	' constrained by union bargaining agreements on scheduling rules.',
	' propagated to edge analytics nodes for near-real-time scoring.',
	' validated through red-team exercises on exposed interfaces.',
	' expressed as capacity thresholds in auto-scaling policies.',
	' correlated with vendor risk tier reassessments annually.',
	' prefaced with customer communication templates for outages.',
	' distributed using canary releases to a pilot user cohort first.',
	' retired when duplicate integrations are consolidated enterprise-wide.',
	' compared with innovation funnel candidates for funding cycles.',
	' sequenced after master service agreement amendments are executed.',
	' documented in the configuration audit trail with before-and-after values.',
	' constrained by ethical AI review boards where models are deployed.',
	' propagated through zero-trust network access policies.',
	' validated using synthetic identities in non-production tenants.',
	' expressed as guardrail metrics on executive scorecards.'
];

function hashString(seed) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
	}
	return hash >>> 0;
}

function readBank() {
	const raw = fs.readFileSync(bankPath, 'utf8');
	const match = raw.match(/DEV_PRACTICE_QUESTIONS[^=]*=\s*(\[[\s\S]*\]);/);
	if (!match) throw new Error('Could not parse devQuestionBank.ts');
	return JSON.parse(match[1]);
}

function writeBank(all) {
	const body = `import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev question bank; merge batches: \`node scripts/extract-questions-from-transcripts.mjs --merge-batches\` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = ${JSON.stringify(all, null, '\t')};
`;
	fs.writeFileSync(bankPath, body, 'utf8');
}

function isLongestCorrect(q) {
	if (q.questionType === 'match' || q.choices.length === 0) return false;
	const correctLen = q.choices[q.correctIndex].length;
	const maxLen = Math.max(...q.choices.map((c) => c.length));
	return correctLen === maxLen;
}

function isMcQuestion(q) {
	return (q.questionType ?? 'single') !== 'match' && q.choices.length === 4;
}

function trackLongestRate(rows) {
	const mcRows = rows.filter(isMcQuestion);
	if (mcRows.length === 0) return 0;
	let longestCorrect = 0;
	for (const q of mcRows) {
		if (isLongestCorrect(q)) longestCorrect++;
	}
	return longestCorrect / mcRows.length;
}

function containsBoilerplate(text) {
	return BOILERPLATE_SUFFIXES.some((s) => text.includes(s));
}

function pickClause(seed, usedNormalized) {
	const start = hashString(seed) % CLAUSE_POOL.length;
	for (let offset = 0; offset < CLAUSE_POOL.length; offset++) {
		const clause = CLAUSE_POOL[(start + offset) % CLAUSE_POOL.length];
		if (containsBoilerplate(clause)) continue;
		return clause;
	}
	throw new Error(`Exhausted clause pool for seed ${seed}`);
}

function padChoice(original, seed, usedNormalized, targetLen) {
	let text = original;
	let attempt = 0;
	while (text.length <= targetLen && attempt < CLAUSE_POOL.length) {
		const clause = pickClause(`${seed}:${attempt}`, usedNormalized);
		const candidate = text + clause;
		const key = candidate.trim().toLowerCase();
		if (!usedNormalized.has(key)) {
			text = candidate;
			usedNormalized.add(key);
			break;
		}
		attempt++;
	}
	if (text.length <= targetLen) {
		const filler = ` (${seed.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)})`;
		text += filler;
		usedNormalized.add(text.trim().toLowerCase());
	}
	return text;
}

function balanceTrack(rows) {
	const usedNormalized = new Set();
	for (const q of rows) {
		for (const choice of q.choices) {
			usedNormalized.add(choice.trim().toLowerCase());
		}
	}

	const updated = rows.map((q) => ({ ...q, choices: [...q.choices] }));
	let rate = trackLongestRate(updated);
	if (rate < TARGET_RATE) return { updated, fixed: 0, rate };

	const candidates = updated
		.map((q, idx) => ({ q, idx }))
		.filter(({ q }) => isMcQuestion(q) && isLongestCorrect(q))
		.sort((a, b) => {
			const gapA =
				a.q.choices[a.q.correctIndex].length -
				Math.max(...a.q.choices.filter((_, i) => i !== a.q.correctIndex).map((c) => c.length));
			const gapB =
				b.q.choices[b.q.correctIndex].length -
				Math.max(...b.q.choices.filter((_, i) => i !== b.q.correctIndex).map((c) => c.length));
			return gapB - gapA;
		});

	let fixed = 0;
	for (const { q, idx } of candidates) {
		if (trackLongestRate(updated) < TARGET_RATE) break;
		if (!isLongestCorrect(q)) continue;

		const correctLen = q.choices[q.correctIndex].length;
		const wrongIndices = q.choices
			.map((c, i) => ({ i, len: c.length }))
			.filter(({ i }) => i !== q.correctIndex)
			.sort((a, b) => a.len - b.len);

		for (const { i: wrongIdx } of wrongIndices) {
			if (q.choices[wrongIdx].length > correctLen) {
				fixed++;
				break;
			}
			const seed = `${q.trackCode}:${q.order}:w${wrongIdx}`;
			const padded = padChoice(q.choices[wrongIdx], seed, usedNormalized, correctLen);
			usedNormalized.delete(q.choices[wrongIdx].trim().toLowerCase());
			usedNormalized.add(padded.trim().toLowerCase());
			updated[idx].choices[wrongIdx] = padded;
			if (padded.length > correctLen) {
				fixed++;
				break;
			}
		}
	}

	return { updated, fixed, rate: trackLongestRate(updated) };
}

const bank = readBank();
const tracks = [...new Set(bank.map((q) => q.trackCode))].sort();
let totalFixed = 0;
const report = [];

const byTrack = new Map();
for (const q of bank) {
	if (!byTrack.has(q.trackCode)) byTrack.set(q.trackCode, []);
	byTrack.get(q.trackCode).push(q);
}

const nextBank = [...bank];
for (const trackCode of tracks) {
	const rows = byTrack.get(trackCode);
	const before = trackLongestRate(rows);
	const { updated, fixed, rate } = balanceTrack(rows);
	totalFixed += fixed;
	report.push({
		trackCode,
		before: (before * 100).toFixed(1) + '%',
		after: (rate * 100).toFixed(1) + '%',
		fixed,
		pass: rate < TARGET_RATE ? 'yes' : 'no'
	});

	const orderMap = new Map(updated.map((q) => [q.order, q]));
	for (let i = 0; i < nextBank.length; i++) {
		if (nextBank[i].trackCode !== trackCode) continue;
		nextBank[i] = orderMap.get(nextBank[i].order);
	}
}

console.log('Track balance report:');
for (const row of report) {
	console.log(
		`  ${row.trackCode.padEnd(10)} before=${row.before} after=${row.after} fixed=${row.fixed} pass=${row.pass}`
	);
}
console.log(`Total questions padded: ${totalFixed}`);

if (!dryRun) {
	writeBank(nextBank);
	console.log(`Updated ${bankPath}`);
} else {
	console.log('Dry run — no files written.');
}

/** CIS-ITSM exam-realism rules (KB0011560 / ServiceNowDocs-aligned). */

import type { QuestionType } from './questionTypes';

export const CIS_ITSM_BANK_SIZE = 90;

export const CIS_ITSM_DOMAIN_TARGETS = {
	'Incident Management': 20,
	'Problem Management': 14,
	'Change Management': 16,
	'Service Portfolio Management': 9,
	'Service Catalog and Request Management': 16,
	'Configuration Management Database': 11,
	'Implementation and Strategy': 4
} as const;

export type CisItsmDomain = keyof typeof CIS_ITSM_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisItsmDomain {
	if (order <= 19) return 'Incident Management';
	if (order <= 33) return 'Problem Management';
	if (order <= 49) return 'Change Management';
	if (order <= 58) return 'Service Portfolio Management';
	if (order <= 74) return 'Service Catalog and Request Management';
	if (order <= 85) return 'Configuration Management Database';
	return 'Implementation and Strategy';
}

export const CIS_ITSM_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |IT |Operations |Change |Problem |Incident |Service |Portfolio |CMDB |Discovery |CAB |Major |Several |Two |How can|How do|How does|How is|How are|How should|Why should|Why would|Which practice|Which approach|Which configuration|Which controls|Which records|Which two|Choose two|What happens|What should|A customer|A program|An open|An administrator|A global|A regional|A CIO|Leadership |Finance |Security )/i.test(
			trimmed
		)
	) {
		return true;
	}
	return false;
}

export const BANNED_CHOICE_PREFIXES = [
	'Captures the choice stating',
	'Matches the scenario in which',
	'Describes the outcome where',
	'Represents the approach that',
	'Reflects the condition that',
	'Corresponds to the option where'
] as const;

export const BANNED_STEM_PREFIXES = [
	'From an admin perspective',
	'In platform teams',
	'In most deployments',
	'From a governance perspective',
	'Practically speaking'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the primary objective of/i,
	/^what is the main purpose of/i,
	/^in the base platform configuration, what automatically happens to a standard incident that remains in the resolved state/i,
	/^in a standard servicenow incident management configuration, how is incident priority determined/i,
	/^which role is required to create and manage blackout and maintenance schedules/i,
	/^when creating a change schedule in simplified change management, which scope option applies/i,
	/^which role is required to create a new ci class in ci class manager/i,
	/^what defines when a problem record can automatically move from the new to the assess state/i,
	/^what capability does service catalog provide/i,
	/^what is the purpose of an order guide/i,
	/^what is the cab workbench used for/i
] as const;

export const STEM_OPENER_CAP = 3;

export type CisItsmQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: string;
	questionType?: QuestionType;
	correctIndexes?: number[];
	correctIndex?: number;
};

export function fourWordOpener(text: string): string {
	return text.trim().split(/\s+/).slice(0, 4).join(' ').toLowerCase();
}

export function containsBannedChoicePrefix(text: string): boolean {
	return BANNED_CHOICE_PREFIXES.some((prefix) => text.includes(prefix));
}

export function containsBannedStemPrefix(text: string): boolean {
	return (
		BANNED_STEM_PREFIXES.some((prefix) => text.startsWith(prefix)) ||
		BANNED_STEM_PATTERNS.some((pattern) => pattern.test(text.trim()))
	);
}

export function validateCisItsmQuestion(q: CisItsmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-ITSM') return issues;

	if (containsBannedStemPrefix(q.prompt)) {
		issues.push(`order ${q.order}: banned stem phrasing`);
	}

	for (const choice of q.choices) {
		if (containsBannedChoicePrefix(choice)) {
			issues.push(`order ${q.order}: banned choice wrapper`);
			break;
		}
	}

	const normalized = q.choices.map((c) => c.trim().toLowerCase());
	if (new Set(normalized).size !== 4) {
		issues.push(`order ${q.order}: duplicate choices in question`);
	}

	if (!Array.isArray(q.sourceUrls) || q.sourceUrls.length === 0) {
		issues.push(`order ${q.order}: missing sourceUrls`);
	}

	if (q.questionType === 'multi') {
		const idxs = q.correctIndexes ?? [];
		if (idxs.length < 2) {
			issues.push(`order ${q.order}: multi question needs 2+ correctIndexes`);
		}
	}

	return issues;
}

export function validateCisItsmScenarioRatio(rows: CisItsmQuestionRow[]): string[] {
	const itsm = rows.filter((q) => q.trackCode === 'CIS-ITSM');
	if (itsm.length === 0) return [];
	const scenarioCount = itsm.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / itsm.length;
	if (ratio < CIS_ITSM_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${itsm.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_ITSM_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisItsmDomainTags(rows: CisItsmQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CIS_ITSM_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CIS-ITSM') continue;
		if (!q.domain) {
			issues.push(`order ${q.order}: missing domain tag`);
			continue;
		}
		const expected = domainForOrder(q.order);
		if (q.domain !== expected) {
			issues.push(`order ${q.order}: domain ${q.domain} does not match order quota ${expected}`);
		}
		domainCounts[q.domain]++;
	}

	for (const [domain, target] of Object.entries(CIS_ITSM_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCisItsmTrack(rows: CisItsmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisItsmQuestion(q));
	}

	issues.push(...validateCisItsmScenarioRatio(rows));
	issues.push(...validateCisItsmDomainTags(rows));

	const openerCounts = new Map<string, number>();
	for (const q of rows) {
		const opener = fourWordOpener(q.prompt);
		openerCounts.set(opener, (openerCounts.get(opener) ?? 0) + 1);
	}
	for (const [opener, count] of openerCounts) {
		if (count > STEM_OPENER_CAP) {
			issues.push(`stem opener "${opener}" used ${count} times (max ${STEM_OPENER_CAP})`);
		}
	}

	const seenChoices = new Map<string, number>();
	for (const q of rows) {
		for (const choice of q.choices) {
			const key = choice.trim().toLowerCase();
			seenChoices.set(key, (seenChoices.get(key) ?? 0) + 1);
		}
	}
	for (const [choice, count] of seenChoices) {
		if (count > 1) {
			issues.push(`duplicate choice text within track (${count}x): ${choice.slice(0, 60)}...`);
		}
	}

	return issues;
}

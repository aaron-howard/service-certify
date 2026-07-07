/** CIS-SM (Certified Implementation Specialist - Service Mapping) exam-realism rules. */

import type { QuestionType } from './questionTypes';

export const CIS_SM_BANK_SIZE = 90;

export const CIS_SM_DOMAIN_TARGETS = {
	'Service Design Strategy': 11,
	'Service Mapping Pattern Design': 18,
	'Service Mapping Configuration': 13,
	'Discovery Configuration': 14,
	'Machine Learning': 13,
	'Configuration Management Database': 10,
	'Service Mapping Engagement Readiness': 11
} as const;

export type CisSmDomain = keyof typeof CIS_SM_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisSmDomain {
	if (order <= 10) return 'Service Design Strategy';
	if (order <= 28) return 'Service Mapping Pattern Design';
	if (order <= 41) return 'Service Mapping Configuration';
	if (order <= 55) return 'Discovery Configuration';
	if (order <= 68) return 'Machine Learning';
	if (order <= 78) return 'Configuration Management Database';
	return 'Service Mapping Engagement Readiness';
}

export const CIS_SM_SCENARIO_MIN_RATIO = 0.7;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |How can|How do|How does|How is|How are|How should|Why should|Why would|Which practice|Which approach|Which configuration|Which design|Which two|Choose two|What happens|What should|A CIO|A CISO|A SOC|A municipal|A stakeholder|A business|An organization|An implementer|An analyst|Leadership |Operations |Several |Two )/i.test(
			trimmed
		)
	) {
		return true;
	}
	return false;
}

export const BANNED_CHOICE_PREFIXES = [
	'Typically,',
	'Operationally,',
	'In practice,',
	'From an implementation standpoint,',
	'From a governance perspective,',
	'In platform terms,',
	'In this scenario,',
	'Practically speaking,',
	'In most deployments,',
	'Under normal policy',
	'Describes the outcome where',
	'Matches the scenario in which',
	'Reflects the condition that',
	'Captures the choice stating',
	'Corresponds to the option where'
] as const;

export const BANNED_STEM_PREFIXES = [
	'From an admin perspective',
	'From an implementation standpoint',
	'From a governance perspective',
	'In platform terms',
	'In most deployments',
	'Practically speaking',
	'Operationally,'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the primary objective of/i,
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisSmQuestionRow = {
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
	return BANNED_CHOICE_PREFIXES.some((prefix) => text.trim().startsWith(prefix));
}

export function containsBannedStemPrefix(text: string): boolean {
	const trimmed = text.trim();
	return (
		BANNED_STEM_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) ||
		BANNED_STEM_PATTERNS.some((pattern) => pattern.test(trimmed))
	);
}

export function validateCisSmQuestion(q: CisSmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-SM') return issues;

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
		} else {
			const sorted = [...idxs].sort((a, b) => a - b);
			if (new Set(sorted).size !== sorted.length) {
				issues.push(`order ${q.order}: duplicate correctIndexes`);
			}
			if (sorted.some((i) => i < 0 || i > 3)) {
				issues.push(`order ${q.order}: correctIndexes out of range`);
			}
			if (q.correctIndex !== undefined && q.correctIndex !== sorted[0]) {
				issues.push(`order ${q.order}: correctIndex must equal lowest correctIndexes entry`);
			}
		}
	} else if (q.correctIndexes !== undefined) {
		issues.push(`order ${q.order}: correctIndexes only valid for multi questions`);
	}

	return issues;
}

export function validateCisSmScenarioRatio(rows: CisSmQuestionRow[]): string[] {
	const sm = rows.filter((q) => q.trackCode === 'CIS-SM');
	if (sm.length === 0) return [];
	const scenarioCount = sm.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / sm.length;
	if (ratio < CIS_SM_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${sm.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_SM_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisSmDomainTags(rows: CisSmQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CIS_SM_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CIS-SM') continue;
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

	for (const [domain, target] of Object.entries(CIS_SM_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCisSmTrack(rows: CisSmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisSmQuestion(q));
	}

	issues.push(...validateCisSmScenarioRatio(rows));
	issues.push(...validateCisSmDomainTags(rows));

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

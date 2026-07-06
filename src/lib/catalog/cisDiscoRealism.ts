/** CIS-DISCO (Certified Implementation Specialist - Discovery) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 75 questions scaled from the 45-question official exam (+30 buffer). */

export const CIS_DISCO_BANK_SIZE = 75;

export const CIS_DISCO_DOMAIN_TARGETS = {
	'Discovery Pattern Design': 23,
	'Discovery Configuration': 22,
	'Configuration Management Database': 15,
	'Discovery Engagement Readiness': 15
} as const;

export type CisDiscoDomain = keyof typeof CIS_DISCO_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisDiscoDomain {
	if (order <= 22) return 'Discovery Pattern Design';
	if (order <= 44) return 'Discovery Configuration';
	if (order <= 59) return 'Configuration Management Database';
	return 'Discovery Engagement Readiness';
}

export const CIS_DISCO_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |Network |Discovery |Classification |An admin|An implementer|An operator|A team|A customer|A schedule|A credential|Which two|Choose two|How should|Why should|What should)/i.test(
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
	'Corresponds to the option where',
	'Represents the approach that'
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
	/^what is the main purpose of/i,
	/^what is the role of an identification section/i,
	/^what do identification rules in ire determine/i,
	/^reconciliation rules primarily control what/i,
	/^what is the primary role of ci class manager/i,
	/^how many ci identifiers should be configured/i,
	/^what does a discovery schedule primarily define/i,
	/^discovery ip services records are used to do what/i,
	/^which sequence reflects the major discovery phases/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisDiscoQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: CisDiscoDomain;
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

export function validateCisDiscoQuestion(q: CisDiscoQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-DISCO') return issues;

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

export function validateCisDiscoScenarioRatio(rows: CisDiscoQuestionRow[]): string[] {
	const disco = rows.filter((q) => q.trackCode === 'CIS-DISCO');
	if (disco.length === 0) return [];
	const scenarioCount = disco.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / disco.length;
	if (ratio < CIS_DISCO_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${disco.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_DISCO_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisDiscoDomainTags(rows: CisDiscoQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-DISCO') continue;
		if (!q.domain) {
			issues.push(`order ${q.order}: missing domain tag`);
			continue;
		}
		if (q.domain !== domainForOrder(q.order)) {
			issues.push(`order ${q.order}: domain ${q.domain} does not match order quota ${domainForOrder(q.order)}`);
		}
	}
	return issues;
}

export function validateCisDiscoTrack(rows: CisDiscoQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisDiscoQuestion(q));
	}

	issues.push(...validateCisDiscoScenarioRatio(rows));
	issues.push(...validateCisDiscoDomainTags(rows));

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

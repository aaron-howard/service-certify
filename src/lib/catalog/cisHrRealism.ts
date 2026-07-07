/** CIS-HR (Certified Implementation Specialist - Human Resources) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 90 questions scaled 1.5x from the 60-question official exam. */

export const CIS_HR_BANK_SIZE = 90;

export const CIS_HR_DOMAIN_TARGETS = {
	'HR System Architecture': 22,
	'Core HR Applications and Employee Center': 32,
	'HR Journeys': 18,
	'Platform, Role, and Contextual Security': 5,
	'Integration Strategy': 9,
	'Implementation and Change Management': 4
} as const;

export type CisHrDomain = keyof typeof CIS_HR_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisHrDomain {
	if (order <= 21) return 'HR System Architecture';
	if (order <= 53) return 'Core HR Applications and Employee Center';
	if (order <= 71) return 'HR Journeys';
	if (order <= 76) return 'Platform, Role, and Contextual Security';
	if (order <= 85) return 'Integration Strategy';
	return 'Implementation and Change Management';
}

export const CIS_HR_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |HR |Benefits |Payroll |Global |Regional |Multi-|Several |Two |How can|How do|How does|How is|How are|How should|Why does|Why do|Why should|Why would|Why apply|Why map|Why link|Which practice|Which tool|Which controls|Which configuration|Which employee|Which lifecycle|Which security|Which integration|Which audit|Which approach|Which records|Which components|Which field|Which items|Which two|Choose two|What happens|What determines|What relationship|An HR|A global|A regional|A new|A multi|A benefits|A payroll|A legacy|An employee|An administrator|An implementer|A program|A COE|Leadership |Operations |Procurement |Finance |Security |Discovery |CMDB |IT )/i.test(
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
	/^in which application scope is the hr case management application/i,
	/^which table is the primary record type for employee hr requests/i,
	/^what does the hr_profile table store/i,
	/^which parent table does hr_case extend/i,
	/^what is recorded on the hr_service table/i,
	/^what relationship exists between hr_task records and hr_case records/i,
	/^which table stores lifecycle event definitions used by journey designer/i,
	/^what is an activity set within a lifecycle event/i,
	/^what does an individual activity represent in a journey/i,
	/^what is the purpose of activity field mappings in journey designer/i,
	/^what is stored in a lifecycle event template/i,
	/^what is contextual security in hr service delivery/i,
	/^what is the delegated developer role used for in hr scoped applications/i,
	/^what is a lifecycle event in hr service delivery/i,
	/^which table links employees to hr cases they opened or are affected by/i,
	/^what is the function of the hr_case_template table/i,
	/^what is the hr manager dashboard designed to show/i,
	/^what is a long-term benefit of combining platform, role, and contextual hr security/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisHrQuestionRow = {
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

export function validateCisHrQuestion(q: CisHrQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-HR') return issues;

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

export function validateCisHrScenarioRatio(rows: CisHrQuestionRow[]): string[] {
	const hr = rows.filter((q) => q.trackCode === 'CIS-HR');
	if (hr.length === 0) return [];
	const scenarioCount = hr.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / hr.length;
	if (ratio < CIS_HR_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${hr.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_HR_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisHrDomainTags(rows: CisHrQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-HR') continue;
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

export function validateCisHrTrack(rows: CisHrQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisHrQuestion(q));
	}

	issues.push(...validateCisHrScenarioRatio(rows));
	issues.push(...validateCisHrDomainTags(rows));

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

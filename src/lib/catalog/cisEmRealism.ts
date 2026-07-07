/** CIS-EM (Certified Implementation Specialist - Event Management) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 60 questions scaled 2x from the 30-question official exam. */

export const CIS_EM_BANK_SIZE = 60;

export const CIS_EM_DOMAIN_TARGETS = {
	'Event Management Overview': 4,
	'Architecture and Discovery': 9,
	'Event Configuration and Use': 16,
	'Alerts and Tasks': 15,
	'Event Sources': 10,
	'Metric Intelligence': 6
} as const;

export type CisEmDomain = keyof typeof CIS_EM_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisEmDomain {
	if (order <= 3) return 'Event Management Overview';
	if (order <= 12) return 'Architecture and Discovery';
	if (order <= 28) return 'Event Configuration and Use';
	if (order <= 43) return 'Alerts and Tasks';
	if (order <= 53) return 'Event Sources';
	return 'Metric Intelligence';
}

export const CIS_EM_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |Network |SNMP |Email |Metric |An admin|An operator|A NOC|A global|A monitoring|A team|A customer|Which two|Choose two|How should|Why should|What should)/i.test(
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
	/^how does servicenow event management transform/i,
	/^what does an event management connector primarily do/i,
	/^what role does the mid server play/i,
	/^which sequence best describes the core event management/i,
	/^what is the message key used for/i,
	/^what is the default polling interval/i,
	/^which event management module is used to configure suppression/i,
	/^which event management module is used to create rules that automatically/i,
	/^which configuration most directly determines the initial assignment/i,
	/^generic json push sources often target which inbound api/i,
	/^email-based event ingestion for event management relies on which/i,
	/^when metrics collection is enabled on a supported connector instance, what type/i,
	/^metric intelligence builds statistical models from historical metric data primarily/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisEmQuestionRow = {
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

export function validateCisEmQuestion(q: CisEmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-EM') return issues;

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

export function validateCisEmScenarioRatio(rows: CisEmQuestionRow[]): string[] {
	const em = rows.filter((q) => q.trackCode === 'CIS-EM');
	if (em.length === 0) return [];
	const scenarioCount = em.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / em.length;
	if (ratio < CIS_EM_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${em.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_EM_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisEmDomainTags(rows: CisEmQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-EM') continue;
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

export function validateCisEmTrack(rows: CisEmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisEmQuestion(q));
	}

	issues.push(...validateCisEmScenarioRatio(rows));
	issues.push(...validateCisEmDomainTags(rows));

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

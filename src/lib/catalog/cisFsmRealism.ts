/** CIS-FSM (Certified Implementation Specialist - Field Service Management) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 90 questions scaled 1.5x from the 60-question official exam. */

export const CIS_FSM_BANK_SIZE = 90;

export const CIS_FSM_DOMAIN_TARGETS = {
	'Field Service Management Fundamentals': 30,
	'Implementation Planning': 10,
	'Implementing Field Service Processes': 40,
	'Implementing Related Processes': 10
} as const;

export type CisFsmDomain = keyof typeof CIS_FSM_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisFsmDomain {
	if (order <= 29) return 'Field Service Management Fundamentals';
	if (order <= 39) return 'Implementation Planning';
	if (order <= 79) return 'Implementing Field Service Processes';
	return 'Implementing Related Processes';
}

export const CIS_FSM_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |Field |Service |Dispatch |Technicians |Operations |Several |Two |Regional |Adoption |Finance |Leadership |Customers |Regulatory |A cable|A dispatcher|A field|A new|A downstream|A parts|A utilities|A technician|Steering |Procurement |Cutover |Legacy |Union |Third-party|Major |Installed |Monday |Dynamic |Datadog |Heartbeat |Automated |Template |Workforce |Capacity |Regulatory |Smart |An administrator|An implementer|Which two|Choose two|How should|Why should|What should)/i.test(
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
	'Under normal policy'
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
	/^which two group types are field service management-specific/i,
	/^in field service management, how does a work order relate/i,
	/^what do work order templates create when applied/i,
	/^service territories in field service management define what/i,
	/^which field service persona reviews draft/i,
	/^which field service persona typically creates/i,
	/^work order lifecycle, task templates, and qualification states are core/i,
	/^where do you enable the qualification requirement/i,
	/^agent user groups configured under field service > group management/i,
	/^which field service role is assigned to technicians/i,
	/^which field service role enables a user to assign/i,
	/^which capability gives field technicians job details/i,
	/^on a field agent user group, the locations covered/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisFsmQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: CisFsmDomain;
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

export function validateCisFsmQuestion(q: CisFsmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-FSM') return issues;

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

export function validateCisFsmScenarioRatio(rows: CisFsmQuestionRow[]): string[] {
	const fsm = rows.filter((q) => q.trackCode === 'CIS-FSM');
	if (fsm.length === 0) return [];
	const scenarioCount = fsm.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / fsm.length;
	if (ratio < CIS_FSM_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${fsm.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_FSM_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisFsmDomainTags(rows: CisFsmQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-FSM') continue;
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

export function validateCisFsmTrack(rows: CisFsmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisFsmQuestion(q));
	}

	issues.push(...validateCisFsmScenarioRatio(rows));
	issues.push(...validateCisFsmDomainTags(rows));

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

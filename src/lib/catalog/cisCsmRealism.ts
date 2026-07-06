/** CIS-CSM (Certified Implementation Specialist - Customer Service Management) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 90 questions scaled 1.5x from the 60-question official exam. */

export const CIS_CSM_BANK_SIZE = 90;

export const CIS_CSM_DOMAIN_TARGETS = {
	'CSM Foundational Data Model': 24,
	'CSM Configuration': 34,
	'Case Management': 15,
	'CSM Workspace Portals Analytics and Reporting': 7,
	'CSM Best Practices and Knowledge Management': 10
} as const;

export type CisCsmDomain = keyof typeof CIS_CSM_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisCsmDomain {
	if (order <= 23) return 'CSM Foundational Data Model';
	if (order <= 57) return 'CSM Configuration';
	if (order <= 72) return 'Case Management';
	if (order <= 79) return 'CSM Workspace Portals Analytics and Reporting';
	return 'CSM Best Practices and Knowledge Management';
}

export const CIS_CSM_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |Support |Security |Legal |Marketing |A CSM|A customer|A retailer|A manufacturer|A field|A sold|A strategic|A consolidated|A global|A read-only|A B2B|Some |Cases |Chat |Consumers |Agents |Supervisors |An agent|An administrator|An entitlement|An implementer|An organization|Which two|Choose two)/i.test(
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
	/^what is the role of an entitlement/i,
	/^what does an install base item represent/i,
	/^what is the key difference between a report/i,
	/^which criterion is not included/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisCsmQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: CisCsmDomain;
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

export function validateCisCsmQuestion(q: CisCsmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-CSM') return issues;

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

export function validateCisCsmScenarioRatio(rows: CisCsmQuestionRow[]): string[] {
	const csm = rows.filter((q) => q.trackCode === 'CIS-CSM');
	if (csm.length === 0) return [];
	const scenarioCount = csm.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / csm.length;
	if (ratio < CIS_CSM_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${csm.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_CSM_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisCsmDomainTags(rows: CisCsmQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-CSM') continue;
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

export function validateCisCsmTrack(rows: CisCsmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisCsmQuestion(q));
	}

	issues.push(...validateCisCsmScenarioRatio(rows));
	issues.push(...validateCisCsmDomainTags(rows));

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

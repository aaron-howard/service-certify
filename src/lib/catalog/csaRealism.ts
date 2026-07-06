/** CSA (Certified System Administrator) exam-realism rules (official blueprint aligned). */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 90 questions scaled 1.5x from the 60-question official exam. */

export const CSA_DOMAIN_TARGETS = {
	'Platform Overview and Navigation': 6,
	'Instance Configuration': 9,
	'Configuring Applications for Collaboration': 18,
	'Self Service and Automation': 18,
	'Database Management and Platform Security': 27,
	'Data Migration and Integration': 12
} as const;

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
	/^what is the purpose of/i,
	/^which feature is used to import data into servicenow/i,
	/^which module stores/i,
	/^what does the system settings/i
] as const;

/** Minimum share of prompts that read as admin scenario/application items. */
export const CSA_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (/^(A |An |The |Your |During |When |After |Before |If a|Given |While |Upon |A service|A manager|A user|An administrator|An import|A department|A knowledge|A notification|A report|A saved|Which actions|Which statements|Which items|Which configuration|Which combination|Which tool|Which two|Which three|Choose two|Choose three|Select all)/i.test(trimmed)) {
		return true;
	}
	return false;
}

export const STEM_OPENER_CAP = 4;

export type CsaQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
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

export function validateCsaQuestion(q: CsaQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CSA') return issues;

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

export function validateCsaScenarioRatio(rows: CsaQuestionRow[]): string[] {
	const csa = rows.filter((q) => q.trackCode === 'CSA');
	if (csa.length === 0) return [];
	const scenarioCount = csa.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / csa.length;
	if (ratio < CSA_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${csa.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CSA_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCsaTrack(rows: CsaQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCsaQuestion(q));
	}

	issues.push(...validateCsaScenarioRatio(rows));

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

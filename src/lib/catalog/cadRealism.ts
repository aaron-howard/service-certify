/** CAD (Certified Application Developer) exam-realism rules (official blueprint aligned). */

import type { QuestionType } from './questionTypes';

/**
 * Bank distribution for the 90-question CAD dev bank, scaled 1.5x from the
 * 60-question official exam using the published domain weightings.
 */
export const CAD_DOMAIN_TARGETS = {
	'Designing and Creating an Application': 18,
	'Application User Interface': 18,
	'Security and Restricting Access': 18,
	'Application Automation': 18,
	'Working with External Data': 9,
	'Managing Applications': 9
} as const;

/**
 * Legacy template wrappers used by the pre-rewrite CAD bank. These leak the
 * "quiz template" tone and are banned in both stems and choices.
 */
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
	/^what is the purpose of an? /i
] as const;

/** Minimum share of prompts that read as scenario/application items (not bare recall). */
export const CAD_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 95) return true;
	if (/^(A |An |The team|A developer|A custom|A field|A user|A business|A scoped|During|When |After |Before |If a|Given |While |Upon |Your |During deployment|After completing|Before saving|A department|A facilities|A script|A record|A flow|A transform|A MID|A new |A table|A company|A facilities|A change|A request|A process|A security|A configuration|A ServiceNow|A low-code|A nightly|A scheduled|A nightly|A catalog|A reference|A UI |A client|A server-side|A before|An after|An async|An onLoad|An onChange|An onSubmit|Which tool|Which configuration|Which design|Which approach|Which sequence|Which packaging|Which mechanism|Which field type|Which Business Rule|Which client script|Which server-side|Which two|Which three|Select all)/i.test(trimmed)) {
		return true;
	}
	return false;
}

export const STEM_OPENER_CAP = 4;

export type CadQuestionRow = {
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

export function validateCadQuestion(q: CadQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CAD') return issues;

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

	// Multi-select integrity: correctIndexes must be a valid 2+ subset and
	// correctIndex must equal the lowest correct index.
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

export function validateCadScenarioRatio(rows: CadQuestionRow[]): string[] {
	const cad = rows.filter((q) => q.trackCode === 'CAD');
	if (cad.length === 0) return [];
	const scenarioCount = cad.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / cad.length;
	if (ratio < CAD_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${cad.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CAD_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCadTrack(rows: CadQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCadQuestion(q));
	}

	issues.push(...validateCadScenarioRatio(rows));

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

/** CPOA (Certified Platform Owner Associate) exam-realism rules — Jul 2026 blueprint. */

import type { MatchPair, QuestionType } from './questionTypes';

/** Bank distribution for 100 questions: 70 official + 30 buffer. */
export const CPOA_DOMAIN_TARGETS = {
	Strategy: 21,
	People: 16,
	Process: 16,
	Technology: 23,
	Data: 11,
	'ServiceNow Governance': 13
} as const;

export const CPOA_BANK_SIZE = 100;

export const BANNED_CHOICE_PREFIXES = [
	'Typically,',
	'Operationally,',
	'In practice,',
	'From an implementation standpoint,',
	'From a governance perspective,',
	'In platform terms,',
	'In this scenario,',
	'Practically speaking,',
	'Describes the outcome where',
	'Captures the choice stating'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CpoaQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	questionType?: QuestionType;
	correctIndexes?: number[];
	correctIndex?: number;
	matchLeftItems?: string[];
	matchRightItems?: string[];
	correctMatches?: MatchPair[];
};

export function fourWordOpener(text: string): string {
	return text.trim().split(/\s+/).slice(0, 4).join(' ').toLowerCase();
}

export function containsBannedChoicePrefix(text: string): boolean {
	return BANNED_CHOICE_PREFIXES.some((prefix) => text.trim().startsWith(prefix));
}

export function containsBannedStemPattern(text: string): boolean {
	return BANNED_STEM_PATTERNS.some((pattern) => pattern.test(text.trim()));
}

export function validateCpoaQuestion(q: CpoaQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CPOA') return issues;

	if (containsBannedStemPattern(q.prompt)) {
		issues.push(`order ${q.order}: banned stem phrasing`);
	}

	const questionType = q.questionType ?? 'single';
	if (questionType === 'match') {
		const left = q.matchLeftItems ?? [];
		const right = q.matchRightItems ?? [];
		const pairs = q.correctMatches ?? [];
		if (left.length < 2 || right.length < 2) {
			issues.push(`order ${q.order}: match question needs matchLeftItems and matchRightItems`);
		}
		if (pairs.length < left.length) {
			issues.push(`order ${q.order}: correctMatches must cover each left item`);
		}
		if (new Set(left.map((s) => s.trim().toLowerCase())).size !== left.length) {
			issues.push(`order ${q.order}: duplicate matchLeftItems`);
		}
	} else {
		for (const choice of q.choices) {
			if (containsBannedChoicePrefix(choice)) {
				issues.push(`order ${q.order}: banned choice wrapper`);
				break;
			}
		}
		const normalized = q.choices.map((c) => c.trim().toLowerCase());
		if (normalized.length !== 4 || new Set(normalized).size !== 4) {
			issues.push(`order ${q.order}: single/multi needs four unique choices`);
		}
	}

	if (!Array.isArray(q.sourceUrls) || q.sourceUrls.length === 0) {
		issues.push(`order ${q.order}: missing sourceUrls`);
	}

	if (questionType === 'multi') {
		const idxs = q.correctIndexes ?? [];
		if (idxs.length < 2) {
			issues.push(`order ${q.order}: multi question needs 2+ correctIndexes`);
		}
	}

	return issues;
}

export function validateCpoaTrack(rows: CpoaQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCpoaQuestion(q));
	}

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

	return issues;
}

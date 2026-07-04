/** CIS-DF (Data Foundations — CMDB and CSDM) exam-realism rules. */

import type { MatchPair, QuestionType } from './questionTypes';

/** Bank distribution for 105 questions: 75 official + 30 buffer. */
export const CIS_DF_DOMAIN_TARGETS = {
	Configuration: 16,
	Ingest: 20,
	Govern: 37,
	Insight: 21,
	'CSDM Fundamentals': 11
} as const;

export const CIS_DF_BANK_SIZE = 105;

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

export type CisDfQuestionRow = {
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

export function validateCisDfQuestion(q: CisDfQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-DF') return issues;

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
	} else {
		for (const choice of q.choices) {
			if (containsBannedChoicePrefix(choice)) {
				issues.push(`order ${q.order}: banned choice wrapper`);
				break;
			}
		}
		const normalized = q.choices.map((c) => c.trim().toLowerCase());
		if (q.choices.length < 4 || new Set(normalized).size !== q.choices.length) {
			issues.push(`order ${q.order}: needs at least four unique choices`);
		}
	}

	if (!Array.isArray(q.sourceUrls) || q.sourceUrls.length === 0) {
		issues.push(`order ${q.order}: missing sourceUrls`);
	}

	if (questionType === 'multi') {
		const idxs = q.correctIndexes ?? [];
		if (idxs.length < 2) {
			issues.push(`order ${q.order}: multi question needs 2+ correctIndexes`);
		} else {
			const sorted = [...idxs].sort((a, b) => a - b);
			if (q.correctIndex !== undefined && q.correctIndex !== sorted[0]) {
				issues.push(`order ${q.order}: correctIndex must equal lowest correctIndexes entry`);
			}
		}
	}

	return issues;
}

export function validateCisDfTrack(rows: CisDfQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCisDfQuestion(q));
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

	const seenChoices = new Map<string, number>();
	for (const q of rows) {
		if (q.questionType === 'match') continue;
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

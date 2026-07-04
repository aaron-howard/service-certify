/** CIS-PA (Certified Implementation Specialist - Platform Analytics) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 90 questions: 60 official + 30 buffer. */
export const CIS_PA_DOMAIN_TARGETS = {
	'Architecture and Deployment': 9,
	'Configure Indicators and Indicator Sources': 23,
	'Configure Breakdowns and Breakdown Sources': 22,
	'Data Collection': 9,
	'Data Visualization and Dashboards': 23,
	'Administration and Advanced Implementation Solutions': 4
} as const;

export const CIS_PA_BANK_SIZE = 90;

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

export type CisPaQuestionRow = {
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

export function containsBannedStemPattern(text: string): boolean {
	return BANNED_STEM_PATTERNS.some((pattern) => pattern.test(text.trim()));
}

export function validateCisPaQuestion(q: CisPaQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-PA') return issues;

	if (containsBannedStemPattern(q.prompt)) {
		issues.push(`order ${q.order}: banned stem phrasing`);
	}

	if (q.questionType === 'match') {
		issues.push(`order ${q.order}: CIS-PA exam does not include match item types`);
	}

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

	if (!Array.isArray(q.sourceUrls) || q.sourceUrls.length === 0) {
		issues.push(`order ${q.order}: missing sourceUrls`);
	}

	if (q.questionType === 'multi') {
		const idxs = q.correctIndexes ?? [];
		if (idxs.length < 2) {
			issues.push(`order ${q.order}: multi question needs 2+ correctIndexes`);
		} else {
			const sorted = [...idxs].sort((a, b) => a - b);
			if (q.correctIndex !== undefined && q.correctIndex !== sorted[0]) {
				issues.push(`order ${q.order}: correctIndex must equal lowest correctIndexes entry`);
			}
			if (sorted.some((i) => i < 0 || i >= q.choices.length)) {
				issues.push(`order ${q.order}: correctIndexes out of range`);
			}
		}
	}

	return issues;
}

export function validateCisPaTrack(rows: CisPaQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCisPaQuestion(q));
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

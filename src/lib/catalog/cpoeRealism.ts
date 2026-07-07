/** CPOE (Certified Platform Owner Expert) exam-realism rules — March 2026 beta blueprint. */

import type { MatchPair, QuestionType } from './questionTypes';

/** Bank distribution for 222 questions scaled from the 192-question official beta exam. */

export const CPOE_DOMAIN_TARGETS = {
	Strategy: 47,
	'Cost/Resource Planning': 32,
	'Implementation and Delivery': 43,
	'ServiceNow Governance': 39,
	'Compliance and Security': 33,
	Innovation: 28
} as const;

export const CPOE_BANK_SIZE = 222;

export type CpoeDomain = keyof typeof CPOE_DOMAIN_TARGETS;

export function domainForOrder(order: number): CpoeDomain {
	if (order <= 46) return 'Strategy';
	if (order <= 78) return 'Cost/Resource Planning';
	if (order <= 121) return 'Implementation and Delivery';
	if (order <= 160) return 'ServiceNow Governance';
	if (order <= 193) return 'Compliance and Security';
	return 'Innovation';
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
	'Describes the outcome where',
	'Captures the choice stating'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CpoeQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: string;
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

export function validateCpoeQuestion(q: CpoeQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CPOE') return issues;

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
		const leftSet = new Set(left.map((s) => s.trim().toLowerCase()));
		if (leftSet.size !== left.length) {
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

export function validateCpoeDomainTags(rows: CpoeQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CPOE_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CPOE') return issues;
		if (!q.domain) {
			issues.push(`order ${q.order}: missing domain tag`);
			continue;
		}
		const expected = domainForOrder(q.order);
		if (q.domain !== expected) {
			issues.push(`order ${q.order}: domain ${q.domain} does not match order quota ${expected}`);
		}
		domainCounts[q.domain]++;
	}

	for (const [domain, target] of Object.entries(CPOE_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCpoeTrack(rows: CpoeQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCpoeQuestion(q));
	}

	issues.push(...validateCpoeDomainTags(rows));

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

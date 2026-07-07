/** CIS-SP (Certified Implementation Specialist - Service Provider) exam-realism rules. */

import type { QuestionType } from './questionTypes';

/** Bank distribution for 75 questions: 45 official + 30 buffer. */
export const CIS_SP_DOMAIN_TARGETS = {
	'Initial Domain Setup and Service Provider Architecture': 5,
	'MSP Operations Strategy': 8,
	'Customer Onboarding and Tenant Lifecycle': 7,
	'Data Separation/Visibility': 15,
	'Process Separation': 19,
	'Foundational Data Management': 11,
	'Domain Support in Applications': 10
} as const;

export const CIS_SP_BANK_SIZE = 75;

export type CisSpDomain = keyof typeof CIS_SP_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisSpDomain {
	if (order <= 4) return 'Initial Domain Setup and Service Provider Architecture';
	if (order <= 12) return 'MSP Operations Strategy';
	if (order <= 19) return 'Customer Onboarding and Tenant Lifecycle';
	if (order <= 34) return 'Data Separation/Visibility';
	if (order <= 53) return 'Process Separation';
	if (order <= 64) return 'Foundational Data Management';
	return 'Domain Support in Applications';
}

export const CIS_SP_SCENARIO_MIN_RATIO = 0.7;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |How can|How do|How does|How is|How are|How should|Why should|Why would|Which practice|Which approach|Which configuration|Which design|Which two|Choose two|What happens|What should|A CIO|A CISO|An MSP|A municipal|A stakeholder|A business|An organization|An implementer|An administrator|Leadership |Operations |Several |Two )/i.test(
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
	'Describes the outcome where',
	'Captures the choice stating'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisSpQuestionRow = {
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

export function containsBannedStemPattern(text: string): boolean {
	return BANNED_STEM_PATTERNS.some((pattern) => pattern.test(text.trim()));
}

export function validateCisSpQuestion(q: CisSpQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-SP') return issues;

	if (containsBannedStemPattern(q.prompt)) {
		issues.push(`order ${q.order}: banned stem phrasing`);
	}

	if (q.questionType === 'match') {
		issues.push(`order ${q.order}: CIS-SP exam does not include match item types`);
	}

	for (const choice of q.choices) {
		if (containsBannedChoicePrefix(choice)) {
			issues.push(`order ${q.order}: banned choice wrapper`);
			break;
		}
	}

	const normalized = q.choices.map((c) => c.trim().toLowerCase());
	if (normalized.length !== 4 || new Set(normalized).size !== 4) {
		issues.push(`order ${q.order}: needs four unique choices`);
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
		}
	}

	return issues;
}

export function validateCisSpScenarioRatio(rows: CisSpQuestionRow[]): string[] {
	const sp = rows.filter((q) => q.trackCode === 'CIS-SP');
	if (sp.length === 0) return [];
	const scenarioCount = sp.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / sp.length;
	if (ratio < CIS_SP_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${sp.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_SP_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisSpDomainTags(rows: CisSpQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CIS_SP_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CIS-SP') continue;
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

	for (const [domain, target] of Object.entries(CIS_SP_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCisSpTrack(rows: CisSpQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCisSpQuestion(q));
	}

	issues.push(...validateCisSpScenarioRatio(rows));
	issues.push(...validateCisSpDomainTags(rows));

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

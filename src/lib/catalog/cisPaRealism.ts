/** CIS-PA (Certified Implementation Specialist - Platform Analytics) exam-realism rules. */

import type { QuestionType } from './questionTypes';

export const CIS_PA_BANK_SIZE = 90;

export const CIS_PA_DOMAIN_TARGETS = {
	'Architecture and Deployment': 9,
	'KPI Design and Strategy': 10,
	'Configure Indicators and Indicator Sources': 15,
	'Configure Breakdowns and Breakdown Sources': 15,
	'Data Collection': 9,
	'Data Governance and Quality': 7,
	'Data Visualization and Dashboards': 15,
	'Advanced Analytics': 6,
	'Administration and Advanced Implementation Solutions': 4
} as const;

export type CisPaDomain = keyof typeof CIS_PA_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisPaDomain {
	if (order <= 8) return 'Architecture and Deployment';
	if (order <= 18) return 'KPI Design and Strategy';
	if (order <= 33) return 'Configure Indicators and Indicator Sources';
	if (order <= 48) return 'Configure Breakdowns and Breakdown Sources';
	if (order <= 57) return 'Data Collection';
	if (order <= 64) return 'Data Governance and Quality';
	if (order <= 79) return 'Data Visualization and Dashboards';
	if (order <= 85) return 'Advanced Analytics';
	return 'Administration and Advanced Implementation Solutions';
}

export const CIS_PA_SCENARIO_MIN_RATIO = 0.65;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |PA |KPI |Operations |Leadership |Executive |Several |Two |How can|How do|How does|How is|How are|How should|Why should|Why would|Which practice|Which approach|Which configuration|Which design|Which two|Choose two|What happens|What should|A CIO|A PA|A program|A municipal|A stakeholder|A business|An admin|An indicator|An operations|Finance |Security )/i.test(
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
	/^what is the main purpose of/i,
	/^where are indicator scores stored/i,
	/^when is a scripted breakdown source the best option/i,
	/^in a breakdown matrix linked to an indicator, what does excluding a breakdown value accomplish/i,
	/^which sequence best describes how pa solution components connect/i,
	/^which implementation step comes first in the standard bottom-up workflow/i,
	/^which field type is frequently used in indicator source conditions/i,
	/^which property on a data collector job definition controls how frequently/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisPaQuestionRow = {
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

export function validateCisPaScenarioRatio(rows: CisPaQuestionRow[]): string[] {
	const pa = rows.filter((q) => q.trackCode === 'CIS-PA');
	if (pa.length === 0) return [];
	const scenarioCount = pa.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / pa.length;
	if (ratio < CIS_PA_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${pa.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_PA_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisPaDomainTags(rows: CisPaQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CIS_PA_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CIS-PA') continue;
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

	for (const [domain, target] of Object.entries(CIS_PA_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCisPaTrack(rows: CisPaQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCisPaQuestion(q));
	}

	issues.push(...validateCisPaScenarioRatio(rows));
	issues.push(...validateCisPaDomainTags(rows));

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

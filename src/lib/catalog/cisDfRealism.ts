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
	/^what is the main purpose of/i,
	/^which scheduled job supplies performance analytics widgets with trending non-compliant ci counts/i
] as const;

export const CIS_DF_SCENARIO_MIN_RATIO = 0.65;

export const CIS_DF_CONTENT_DIFFICULTIES = ['Foundation', 'Intermediate', 'Advanced'] as const;
export type CisDfContentDifficulty = (typeof CIS_DF_CONTENT_DIFFICULTIES)[number];

/** Minimum share of bank tagged Advanced (troubleshooting / multisource depth). */
export const CIS_DF_ADVANCED_MIN_RATIO = 0.15;

/** ServiceNow docs URL must use the public docs host. */
export const CIS_DF_SOURCE_URL_PATTERN = /^https:\/\/www\.servicenow\.com\/docs\/r\//;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |Operations |Discovery |SCCM |Finance |Leadership |Auditors |Stewards |Analyst|A CMDB|A data|A vendor|A SaaS|A cloud|A compliance|A change|A program|A field|Two integration|Lab hardware|From the|Completeness scores|SCCM and|Which two|Which three|Choose two|Choose three|Match each)/i.test(trimmed)) {
		return true;
	}
	return false;
}

export type CisDfDomain = keyof typeof CIS_DF_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisDfDomain {
	if (order <= 15) return 'Configuration';
	if (order <= 35) return 'Ingest';
	if (order <= 72) return 'Govern';
	if (order <= 93) return 'Insight';
	return 'CSDM Fundamentals';
}

export const STEM_OPENER_CAP = 4;

export type CisDfQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
	domain?: CisDfDomain;
	contentDifficulty?: CisDfContentDifficulty;
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
	} else {
		for (const url of q.sourceUrls) {
			if (!CIS_DF_SOURCE_URL_PATTERN.test(url)) {
				issues.push(`order ${q.order}: sourceUrl must use https://www.servicenow.com/docs/r/ (${url})`);
				break;
			}
		}
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

export function validateCisDfContentDifficulty(rows: CisDfQuestionRow[]): string[] {
	const issues: string[] = [];
	let advanced = 0;
	let tagged = 0;
	for (const q of rows) {
		if (q.trackCode !== 'CIS-DF') continue;
		if (!q.contentDifficulty) {
			issues.push(`order ${q.order}: missing contentDifficulty tag`);
			continue;
		}
		if (!CIS_DF_CONTENT_DIFFICULTIES.includes(q.contentDifficulty)) {
			issues.push(`order ${q.order}: invalid contentDifficulty ${q.contentDifficulty}`);
		}
		tagged++;
		if (q.contentDifficulty === 'Advanced') advanced++;
	}
	if (tagged > 0 && advanced / tagged < CIS_DF_ADVANCED_MIN_RATIO) {
		issues.push(
			`Advanced contentDifficulty ${advanced}/${tagged} (${Math.round((advanced / tagged) * 100)}%) below minimum ${Math.round(CIS_DF_ADVANCED_MIN_RATIO * 100)}%`
		);
	}
	return issues;
}

export function validateCisDfScenarioRatio(rows: CisDfQuestionRow[]): string[] {
	const df = rows.filter((q) => q.trackCode === 'CIS-DF');
	if (df.length === 0) return [];
	const scenarioCount = df.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / df.length;
	if (ratio < CIS_DF_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${df.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_DF_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisDfDomainTags(rows: CisDfQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		if (q.trackCode !== 'CIS-DF') continue;
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

export function validateCisDfTrack(rows: CisDfQuestionRow[]): string[] {
	const issues: string[] = [];
	for (const q of rows) {
		issues.push(...validateCisDfQuestion(q));
	}

	issues.push(...validateCisDfScenarioRatio(rows));
	issues.push(...validateCisDfDomainTags(rows));
	issues.push(...validateCisDfContentDifficulty(rows));

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

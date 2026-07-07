/** CIS-SIR (Certified Implementation Specialist - Security Incident Response) exam-realism rules. */

import type { QuestionType } from './questionTypes';

export const CIS_SIR_BANK_SIZE = 90;

export const CIS_SIR_DOMAIN_TARGETS = {
	'SIR Overview and Data Visualization': 10,
	'Incident Response Strategy': 11,
	'Implementation Planning': 9,
	'Security Incident Creation and Threat Intelligence': 11,
	'Security Incident and Threat Intelligence Integrations': 13,
	'Security Incident Response Management': 13,
	'Risk Calculations and Post Incident Response': 9,
	'Automation and Standard Processes': 14
} as const;

export type CisSirDomain = keyof typeof CIS_SIR_DOMAIN_TARGETS;

export function domainForOrder(order: number): CisSirDomain {
	if (order <= 9) return 'SIR Overview and Data Visualization';
	if (order <= 20) return 'Incident Response Strategy';
	if (order <= 29) return 'Implementation Planning';
	if (order <= 40) return 'Security Incident Creation and Threat Intelligence';
	if (order <= 53) return 'Security Incident and Threat Intelligence Integrations';
	if (order <= 66) return 'Security Incident Response Management';
	if (order <= 75) return 'Risk Calculations and Post Incident Response';
	return 'Automation and Standard Processes';
}

export const CIS_SIR_SCENARIO_MIN_RATIO = 0.7;

export function isScenarioStylePrompt(prompt: string): boolean {
	const trimmed = prompt.trim();
	if (trimmed.length >= 90) return true;
	if (
		/^(A |An |The |Your |During |When |After |Before |If |Given |While |Upon |How can|How do|How does|How is|How are|How should|Why should|Why would|Which practice|Which approach|Which configuration|Which design|Which two|Choose two|What happens|What should|A CIO|A CISO|A SOC|A municipal|A stakeholder|A business|An organization|An implementer|An analyst|Leadership |Operations |Several |Two )/i.test(
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
	'Under normal policy',
	'Describes the outcome where',
	'Matches the scenario in which',
	'Reflects the condition that',
	'Captures the choice stating',
	'Corresponds to the option where',
	'Represents the approach that'
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
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 4;

export type CisSirQuestionRow = {
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

export function containsBannedStemPrefix(text: string): boolean {
	const trimmed = text.trim();
	return (
		BANNED_STEM_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) ||
		BANNED_STEM_PATTERNS.some((pattern) => pattern.test(trimmed))
	);
}

export function validateCisSirQuestion(q: CisSirQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-SIR') return issues;

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

export function validateCisSirScenarioRatio(rows: CisSirQuestionRow[]): string[] {
	const sir = rows.filter((q) => q.trackCode === 'CIS-SIR');
	if (sir.length === 0) return [];
	const scenarioCount = sir.filter((q) => isScenarioStylePrompt(q.prompt)).length;
	const ratio = scenarioCount / sir.length;
	if (ratio < CIS_SIR_SCENARIO_MIN_RATIO) {
		return [
			`scenario-style prompts ${scenarioCount}/${sir.length} (${Math.round(ratio * 100)}%) below minimum ${Math.round(CIS_SIR_SCENARIO_MIN_RATIO * 100)}%`
		];
	}
	return [];
}

export function validateCisSirDomainTags(rows: CisSirQuestionRow[]): string[] {
	const issues: string[] = [];
	const domainCounts = Object.fromEntries(
		Object.keys(CIS_SIR_DOMAIN_TARGETS).map((d) => [d, 0])
	) as Record<string, number>;

	for (const q of rows) {
		if (q.trackCode !== 'CIS-SIR') continue;
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

	for (const [domain, target] of Object.entries(CIS_SIR_DOMAIN_TARGETS)) {
		if (domainCounts[domain] !== target) {
			issues.push(`domain ${domain}: expected ${target}, got ${domainCounts[domain] ?? 0}`);
		}
	}

	return issues;
}

export function validateCisSirTrack(rows: CisSirQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisSirQuestion(q));
	}

	issues.push(...validateCisSirScenarioRatio(rows));
	issues.push(...validateCisSirDomainTags(rows));

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

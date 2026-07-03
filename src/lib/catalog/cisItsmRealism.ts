/** CIS-ITSM exam-realism rules (KB0011560 / ServiceNowDocs-aligned). */

export const CIS_ITSM_DOMAIN_TARGETS = {
	'Incident Management': 23,
	'Problem Management': 14,
	'Change Management': 23,
	'Service Portfolio Management': 5,
	'Service Catalog and Request Management': 23,
	'Configuration Management Database': 5
} as const;

export const BANNED_CHOICE_PREFIXES = [
	'Captures the choice stating',
	'Matches the scenario in which',
	'Describes the outcome where',
	'Represents the approach that',
	'Reflects the condition that',
	'Corresponds to the option where'
] as const;

export const BANNED_STEM_PREFIXES = [
	'From an admin perspective',
	'In platform teams',
	'In most deployments',
	'From a governance perspective',
	'Practically speaking'
] as const;

export const BANNED_STEM_PATTERNS = [
	/^what is the primary purpose of/i,
	/^what is the primary objective of/i,
	/^what is the main purpose of/i
] as const;

export const STEM_OPENER_CAP = 3;

export type CisItsmQuestionRow = {
	trackCode: string;
	order: number;
	prompt: string;
	choices: string[];
	sourceUrls: string[];
};

export function fourWordOpener(text: string): string {
	return text.trim().split(/\s+/).slice(0, 4).join(' ').toLowerCase();
}

export function containsBannedChoicePrefix(text: string): boolean {
	return BANNED_CHOICE_PREFIXES.some((prefix) => text.includes(prefix));
}

export function containsBannedStemPrefix(text: string): boolean {
	return (
		BANNED_STEM_PREFIXES.some((prefix) => text.startsWith(prefix)) ||
		BANNED_STEM_PATTERNS.some((pattern) => pattern.test(text.trim()))
	);
}

export function validateCisItsmQuestion(q: CisItsmQuestionRow): string[] {
	const issues: string[] = [];
	if (q.trackCode !== 'CIS-ITSM') return issues;

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

	return issues;
}

export function validateCisItsmTrack(rows: CisItsmQuestionRow[]): string[] {
	const issues: string[] = [];

	for (const q of rows) {
		issues.push(...validateCisItsmQuestion(q));
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

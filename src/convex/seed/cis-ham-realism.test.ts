import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import {
	type CisHamQuestionRow,
	BANNED_CHOICE_PREFIXES,
	BANNED_STEM_PREFIXES,
	CIS_HAM_BANK_SIZE,
	CIS_HAM_DOMAIN_TARGETS,
	STEM_OPENER_CAP,
	containsBannedChoicePrefix,
	containsBannedStemPrefix,
	domainForOrder,
	fourWordOpener,
	isScenarioStylePrompt,
	validateCisHamTrack
} from '$lib/catalog/cisHamRealism';

const TRACK = 'CIS-HAM';
const V2_ORDERS = Array.from({ length: 90 }, (_, i) => i);

function rowsFor(orders?: number[]) {
	const all = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);
	if (!orders) return all;
	return all.filter((q) => orders.includes(q.order));
}

describe('CIS-HAM v2 realism (full track)', () => {
	const proofBatch = rowsFor(V2_ORDERS);

	it('has ninety v2 questions at orders 0-89', () => {
		expect(proofBatch).toHaveLength(90);
		expect(proofBatch.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes shared realism validation', () => {
		expect(validateCisHamTrack(proofBatch as CisHamQuestionRow[])).toEqual([]);
	});

	it('meets scenario-style minimum across the v2 bank', () => {
		const scenarioCount = proofBatch.filter((q) => isScenarioStylePrompt(q.prompt)).length;
		expect(scenarioCount / CIS_HAM_BANK_SIZE).toBeGreaterThanOrEqual(0.65);
	});

	it('tags each question with the expected domain for its order', () => {
		const domainCounts = Object.fromEntries(
			Object.keys(CIS_HAM_DOMAIN_TARGETS).map((d) => [d, 0])
		) as Record<string, number>;
		for (const q of proofBatch) {
			expect(q.domain).toBe(domainForOrder(q.order));
			domainCounts[q.domain!]++;
		}
		for (const [domain, target] of Object.entries(CIS_HAM_DOMAIN_TARGETS)) {
			expect(domainCounts[domain]).toBe(target);
		}
	});

	it('does not use banned choice wrapper prefixes', () => {
		for (const q of proofBatch) {
			for (const choice of q.choices) {
				expect(containsBannedChoicePrefix(choice)).toBe(false);
			}
		}
	});

	it('does not use banned stem prefixes or generic purpose stems', () => {
		for (const q of proofBatch) {
			expect(containsBannedStemPrefix(q.prompt)).toBe(false);
		}
	});

	it('limits repeated four-word stem openers in the proof batch', () => {
		const counts = new Map<string, number>();
		for (const q of proofBatch) {
			const opener = fourWordOpener(q.prompt);
			counts.set(opener, (counts.get(opener) ?? 0) + 1);
		}
		for (const count of counts.values()) {
			expect(count).toBeLessThanOrEqual(STEM_OPENER_CAP);
		}
	});

	it('grounds each proof question in ServiceNow documentation URLs', () => {
		for (const q of proofBatch) {
			expect(q.sourceUrls.length).toBeGreaterThan(0);
			expect(q.sourceUrls.every((url) => url.startsWith('https://'))).toBe(true);
		}
	});

	it('documents banned legacy patterns for future full-track rewrite', () => {
		expect(BANNED_STEM_PREFIXES.length).toBeGreaterThan(0);
		expect(BANNED_CHOICE_PREFIXES.length).toBeGreaterThan(0);
	});
});

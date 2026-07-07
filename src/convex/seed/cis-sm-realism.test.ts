import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import {
	type CisSmQuestionRow,
	CIS_SM_BANK_SIZE,
	CIS_SM_DOMAIN_TARGETS,
	domainForOrder,
	isScenarioStylePrompt,
	validateCisSmTrack
} from '$lib/catalog/cisSmRealism';

const TRACK = 'CIS-SM';
const V2_ORDERS = Array.from({ length: CIS_SM_BANK_SIZE }, (_, i) => i);

describe('CIS-SM v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 90 v2 questions at orders 0-89', () => {
		expect(rows).toHaveLength(CIS_SM_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-SM realism validation', () => {
		expect(validateCisSmTrack(rows as CisSmQuestionRow[])).toEqual([]);
	});

	it('meets scenario-style minimum across the v2 bank', () => {
		const scenarioCount = rows.filter((q) => isScenarioStylePrompt(q.prompt)).length;
		expect(scenarioCount / CIS_SM_BANK_SIZE).toBeGreaterThanOrEqual(0.7);
	});

	it('tags each question with the expected domain for its order', () => {
		const domainCounts = Object.fromEntries(
			Object.keys(CIS_SM_DOMAIN_TARGETS).map((d) => [d, 0])
		) as Record<string, number>;
		for (const q of rows) {
			expect(q.domain).toBe(domainForOrder(q.order));
			domainCounts[q.domain!]++;
		}
		for (const [domain, target] of Object.entries(CIS_SM_DOMAIN_TARGETS)) {
			expect(domainCounts[domain]).toBe(target);
		}
	});

	it('includes multi and single item types only', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBe(0);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(6);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(75);
	});
});

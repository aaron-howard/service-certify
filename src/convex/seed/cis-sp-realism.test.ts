import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import {
	type CisSpQuestionRow,
	CIS_SP_BANK_SIZE,
	CIS_SP_DOMAIN_TARGETS,
	domainForOrder,
	isScenarioStylePrompt,
	validateCisSpTrack
} from '$lib/catalog/cisSpRealism';

const TRACK = 'CIS-SP';
const V2_ORDERS = Array.from({ length: CIS_SP_BANK_SIZE }, (_, i) => i);

describe('CIS-SP v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 75 v2 questions at orders 0-74', () => {
		expect(rows).toHaveLength(CIS_SP_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-SP realism validation', () => {
		expect(validateCisSpTrack(rows as CisSpQuestionRow[])).toEqual([]);
	});

	it('meets scenario-style minimum across the v2 bank', () => {
		const scenarioCount = rows.filter((q) => isScenarioStylePrompt(q.prompt)).length;
		expect(scenarioCount / CIS_SP_BANK_SIZE).toBeGreaterThanOrEqual(0.7);
	});

	it('tags each question with the expected domain for its order', () => {
		const domainCounts = Object.fromEntries(
			Object.keys(CIS_SP_DOMAIN_TARGETS).map((d) => [d, 0])
		) as Record<string, number>;
		for (const q of rows) {
			expect(q.domain).toBe(domainForOrder(q.order));
			domainCounts[q.domain!]++;
		}
		for (const [domain, target] of Object.entries(CIS_SP_DOMAIN_TARGETS)) {
			expect(domainCounts[domain]).toBe(target);
		}
	});

	it('includes multi and single item types only', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBe(0);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(12);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(50);
	});
});

import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import {
	CPOP_BANK_SIZE,
	CPOP_DOMAIN_TARGETS,
	domainForOrder,
	validateCpopTrack
} from '$lib/catalog/cpopRealism';

const TRACK = 'CPOP';
const V2_ORDERS = Array.from({ length: CPOP_BANK_SIZE }, (_, i) => i);

describe('CPOP v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 100 v2 questions at orders 0-99', () => {
		expect(rows).toHaveLength(CPOP_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CPOP realism validation', () => {
		expect(validateCpopTrack(rows)).toEqual([]);
	});

	it('tags every question with the domain quota for its order slot', () => {
		const counts = Object.fromEntries(
			Object.keys(CPOP_DOMAIN_TARGETS).map((d) => [d, 0])
		) as Record<string, number>;

		for (const q of rows) {
			expect(q.domain).toBe(domainForOrder(q.order));
			counts[q.domain!]++;
		}

		for (const [domain, target] of Object.entries(CPOP_DOMAIN_TARGETS)) {
			expect(counts[domain]).toBe(target);
		}
	});

	it('includes match, multi, and single item types', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBeGreaterThanOrEqual(18);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(15);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(55);
	});
});

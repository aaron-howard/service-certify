import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { CIS_PA_BANK_SIZE, validateCisPaTrack } from '$lib/catalog/cisPaRealism';

const TRACK = 'CIS-PA';
const V2_ORDERS = Array.from({ length: CIS_PA_BANK_SIZE }, (_, i) => i);

describe('CIS-PA v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 90 v2 questions at orders 0-89', () => {
		expect(rows).toHaveLength(CIS_PA_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-PA realism validation', () => {
		expect(validateCisPaTrack(rows)).toEqual([]);
	});

	it('includes multi and single item types only', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBe(0);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(15);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(65);
	});
});

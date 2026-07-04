import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { CIS_SP_BANK_SIZE, validateCisSpTrack } from '$lib/catalog/cisSpRealism';

const TRACK = 'CIS-SP';
const V2_ORDERS = Array.from({ length: CIS_SP_BANK_SIZE }, (_, i) => i);

describe('CIS-SP v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 75 v2 questions at orders 0-74', () => {
		expect(rows).toHaveLength(CIS_SP_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-SP realism validation', () => {
		expect(validateCisSpTrack(rows)).toEqual([]);
	});

	it('includes multi and single item types only', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBe(0);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(12);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(50);
	});
});

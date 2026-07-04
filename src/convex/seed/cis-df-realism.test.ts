import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { CIS_DF_BANK_SIZE, validateCisDfTrack } from '$lib/catalog/cisDfRealism';

const TRACK = 'CIS-DF';
const V2_ORDERS = Array.from({ length: CIS_DF_BANK_SIZE }, (_, i) => i);

describe('CIS-DF v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 105 v2 questions at orders 0-104', () => {
		expect(rows).toHaveLength(CIS_DF_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-DF realism validation', () => {
		expect(validateCisDfTrack(rows)).toEqual([]);
	});

	it('includes match, multi, and single item types', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBeGreaterThanOrEqual(18);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(18);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(60);
	});
});

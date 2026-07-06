import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { type CisDiscoQuestionRow, validateCisDiscoTrack } from '$lib/catalog/cisDiscoRealism';

const TRACK = 'CIS-DISCO';
const V2_ORDERS = Array.from({ length: 75 }, (_, i) => i);

describe('CIS-DISCO question quality', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 75 bank questions with contiguous orders', () => {
		expect(rows).toHaveLength(75);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-DISCO realism validation', () => {
		expect(validateCisDiscoTrack(rows as CisDiscoQuestionRow[])).toEqual([]);
	});
});

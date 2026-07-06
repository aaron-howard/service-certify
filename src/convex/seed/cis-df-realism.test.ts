import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from '../../convex/seed/devQuestionBank';
import { CIS_DF_BANK_SIZE, CIS_DF_SCENARIO_MIN_RATIO, isScenarioStylePrompt, validateCisDfTrack, type CisDfQuestionRow } from '$lib/catalog/cisDfRealism';

const TRACK = 'CIS-DF';
const V2_ORDERS = Array.from({ length: CIS_DF_BANK_SIZE }, (_, i) => i);

describe('CIS-DF v2 realism', () => {
	const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === TRACK);

	it('has 105 v2 questions at orders 0-104', () => {
		expect(rows).toHaveLength(CIS_DF_BANK_SIZE);
		expect(rows.map((q) => q.order).sort((a, b) => a - b)).toEqual(V2_ORDERS);
	});

	it('passes CIS-DF realism validation', () => {
		expect(validateCisDfTrack(rows as CisDfQuestionRow[])).toEqual([]);
	});

	it('includes match, multi, and single item types', () => {
		const types = rows.map((q) => q.questionType ?? 'single');
		expect(types.filter((t) => t === 'match').length).toBeGreaterThanOrEqual(18);
		expect(types.filter((t) => t === 'multi').length).toBeGreaterThanOrEqual(18);
		expect(types.filter((t) => t === 'single').length).toBeGreaterThanOrEqual(60);
	});

	it('uses mostly scenario-style application prompts', () => {
		const scenarioCount = rows.filter((q) => isScenarioStylePrompt(q.prompt)).length;
		expect(scenarioCount / rows.length).toBeGreaterThanOrEqual(CIS_DF_SCENARIO_MIN_RATIO);
	});

	it('tags each question with a blueprint domain', () => {
		expect(rows.every((q) => typeof q.domain === 'string' && q.domain.length > 0)).toBe(true);
	});

	it('tags each question with a content difficulty level', () => {
		expect(rows.every((q) => typeof q.contentDifficulty === 'string' && q.contentDifficulty.length > 0)).toBe(
			true
		);
	});
});

import { describe, expect, it } from 'vitest';
import { DEV_PRACTICE_QUESTIONS } from './devQuestionBank';
import { CERTIFICATION_TRACKS_FOR_SEED } from '../catalog/tracksCanonical';
import {
	EXAM_QUESTION_BANK_TARGETS,
	QUESTION_BANK_BUFFER,
	getOfficialQuestionCount,
	getQuestionBankTarget
} from '../../lib/catalog/examQuestionPolicy';

const DEFAULT_QUESTIONS_PER_TRACK = 5;

describe('DEV_PRACTICE_QUESTIONS bank', () => {
	it('tracks bank progress toward official+30 targets', () => {
		for (const [trackCode, target] of Object.entries(EXAM_QUESTION_BANK_TARGETS)) {
			const rows = DEV_PRACTICE_QUESTIONS.filter((q) => q.trackCode === trackCode);
			expect(rows.length).toBeGreaterThanOrEqual(DEFAULT_QUESTIONS_PER_TRACK);
			const orders = rows.map((q) => q.order).sort((a, b) => a - b);
			expect(orders).toEqual([...Array(rows.length).keys()]);
			expect(rows.length).toBe(target);
		}
	});

	it('expands all certification tracks in the policy map', () => {
		const expanded = new Set(Object.keys(EXAM_QUESTION_BANK_TARGETS));
		for (const track of CERTIFICATION_TRACKS_FOR_SEED) {
			expect(expanded.has(track.code)).toBe(true);
		}
	});

	it('validates row shape for every question', () => {
		for (const q of DEV_PRACTICE_QUESTIONS) {
			if (q.questionType === 'match') {
				expect(q.matchLeftItems?.length ?? 0).toBeGreaterThanOrEqual(2);
				expect(q.matchRightItems?.length ?? 0).toBeGreaterThanOrEqual(2);
				expect(q.correctMatches?.length ?? 0).toBeGreaterThanOrEqual(2);
			} else {
				expect(q.choices.length).toBeGreaterThanOrEqual(4);
				expect(q.correctIndex).toBeGreaterThanOrEqual(0);
				expect(q.correctIndex).toBeLessThan(q.choices.length);
			}
			expect(q.prompt.trim().length).toBeGreaterThan(0);
			expect(q.explanation.trim().length).toBeGreaterThan(0);
			expect(q.sourceUrls.length).toBeGreaterThan(0);
		}
	});

	it('has unique order per trackCode', () => {
		const seen = new Set<string>();
		for (const q of DEV_PRACTICE_QUESTIONS) {
			const key = `${q.trackCode}:${q.order}`;
			expect(seen.has(key)).toBe(false);
			seen.add(key);
		}
	});
});

describe('exam question bank policy', () => {
	it('uses official count + buffer for every seeded track', () => {
		for (const track of CERTIFICATION_TRACKS_FOR_SEED) {
			expect(getQuestionBankTarget(track.code)).toBe(
				getOfficialQuestionCount(track.code) + QUESTION_BANK_BUFFER
			);
		}
	});
});

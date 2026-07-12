import { describe, expect, it } from 'vitest';
import {
	draftStorageKey,
	loadSessionDraft,
	parseQuestionFromUrl,
	questionQueryValue,
	saveSessionDraft,
	shouldSyncQuestionUrl,
	urlWithQuestionIndex,
	type PracticeSessionDraft
} from './sessionDraft';

describe('sessionDraft', () => {
	it('builds stable storage keys', () => {
		expect(draftStorageKey('CSA', 'sample')).toBe('service-certify:practice:CSA:sample');
	});

	it('parses 1-based question query params', () => {
		expect(parseQuestionFromUrl('3')).toBe(2);
		expect(parseQuestionFromUrl('0')).toBeNull();
		expect(parseQuestionFromUrl(null)).toBeNull();
	});

	it('formats question query values', () => {
		expect(questionQueryValue(0)).toBe('1');
		expect(questionQueryValue(4)).toBe('5');
	});

	it('round-trips drafts through localStorage', () => {
		const key = 'service-certify:practice:test:sample';
		const draft: PracticeSessionDraft = {
			version: 1,
			trackCode: 'CSA',
			mode: 'sample',
			sessionSeed: 'seed-123',
			phase: 'live',
			currentIndex: 2,
			remaining: 120,
			selected: { 1: 0 },
			selectedMulti: {},
			selectedMatch: {},
			flagged: [1],
			updatedAt: Date.now()
		};

		saveSessionDraft(key, draft);
		expect(loadSessionDraft(key)).toEqual(draft);
		localStorage.removeItem(key);
	});

	it('detects when URL question param is stale', () => {
		const url = new URL('https://example.com/practice?q=2');
		expect(shouldSyncQuestionUrl(url, 2)).toBe(true);
		expect(urlWithQuestionIndex(url, 2).searchParams.get('q')).toBe('3');

		const synced = new URL('https://example.com/practice?q=3');
		expect(shouldSyncQuestionUrl(synced, 2)).toBe(false);
	});
});

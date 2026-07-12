export type PracticeSessionPhase = 'intro' | 'live' | 'review' | 'summary';

export type PracticeSessionDraft = {
	version: 1;
	trackCode: string;
	mode: 'sample' | 'full';
	sessionSeed: string;
	phase: PracticeSessionPhase;
	currentIndex: number;
	remaining: number;
	selected: Record<number, number>;
	selectedMulti: Record<number, number[]>;
	selectedMatch: Record<number, Record<number, number>>;
	flagged: number[];
	updatedAt: number;
};

const STORAGE_PREFIX = 'service-certify:practice';

export function draftStorageKey(trackCode: string, mode: 'sample' | 'full'): string {
	return `${STORAGE_PREFIX}:${trackCode}:${mode}`;
}

export function parseQuestionFromUrl(value: string | null): number | null {
	if (!value) return null;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) return null;
	return parsed - 1;
}

export function questionQueryValue(index: number): string {
	return String(index + 1);
}

export function loadSessionDraft(key: string): PracticeSessionDraft | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as PracticeSessionDraft;
		if (parsed?.version !== 1) return null;
		if (!parsed.trackCode || !parsed.sessionSeed) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function saveSessionDraft(key: string, draft: PracticeSessionDraft): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(draft));
	} catch {
		// Quota or privacy mode — ignore.
	}
}

export function clearSessionDraft(key: string): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(key);
	} catch {
		// ignore
	}
}

export function shouldSyncQuestionUrl(currentUrl: URL, index: number): boolean {
	return currentUrl.searchParams.get('q') !== questionQueryValue(index);
}

export function urlWithQuestionIndex(currentUrl: URL, index: number): URL {
	const next = new URL(currentUrl);
	next.searchParams.set('q', questionQueryValue(index));
	return next;
}

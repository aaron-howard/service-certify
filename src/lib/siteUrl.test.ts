import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('siteUrl', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.doUnmock('$env/dynamic/public');
	});

	it('returns null when PUBLIC_APP_URL is unset', async () => {
		vi.doMock('$env/dynamic/public', () => ({ env: {} }));
		const { getPublicAppUrl, absoluteAppUrl } = await import('./siteUrl');
		expect(getPublicAppUrl()).toBeNull();
		expect(absoluteAppUrl('/exams')).toBeNull();
	});

	it('strips trailing slash and builds absolute paths', async () => {
		vi.doMock('$env/dynamic/public', () => ({
			env: { PUBLIC_APP_URL: 'https://service-certify.example/' }
		}));
		const { getPublicAppUrl, absoluteAppUrl } = await import('./siteUrl');
		expect(getPublicAppUrl()).toBe('https://service-certify.example');
		expect(absoluteAppUrl('/exams')).toBe('https://service-certify.example/exams');
		expect(absoluteAppUrl('dashboard')).toBe('https://service-certify.example/dashboard');
	});
});

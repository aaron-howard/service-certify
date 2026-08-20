import { describe, it, expect } from 'vitest';
import { absoluteAppUrlFrom, getPublicAppUrlFrom } from './siteUrlCore';

describe('siteUrl', () => {
	it('returns null when PUBLIC_APP_URL is unset', () => {
		expect(getPublicAppUrlFrom(undefined)).toBeNull();
		expect(absoluteAppUrlFrom(null, '/exams')).toBeNull();
	});

	it('strips trailing slash and builds absolute paths', () => {
		const base = getPublicAppUrlFrom('https://service-certify.example/');
		expect(base).toBe('https://service-certify.example');
		expect(absoluteAppUrlFrom(base, '/exams')).toBe('https://service-certify.example/exams');
		expect(absoluteAppUrlFrom(base, 'dashboard')).toBe('https://service-certify.example/dashboard');
	});
});

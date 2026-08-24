import { describe, expect, it } from 'vitest';
import { getOAuthAuthorizationUrl, OAUTH_PROVIDERS, toOAuthProviderSlug } from '$lib/workos.server';

describe('toOAuthProviderSlug', () => {
	it('accepts every configured provider slug', () => {
		for (const slug of Object.keys(OAUTH_PROVIDERS)) {
			expect(toOAuthProviderSlug(slug)).toBe(slug);
		}
	});

	it('rejects an unknown provider rather than passing it through', () => {
		expect(toOAuthProviderSlug('facebook')).toBeUndefined();
		expect(toOAuthProviderSlug('okta')).toBeUndefined();
	});

	it('treats legacy github as absent rather than persisting it', () => {
		expect(toOAuthProviderSlug('github')).toBeUndefined();
	});

	it('rejects missing and empty values', () => {
		expect(toOAuthProviderSlug(undefined)).toBeUndefined();
		expect(toOAuthProviderSlug(null)).toBeUndefined();
		expect(toOAuthProviderSlug('')).toBeUndefined();
	});

	it('is case-sensitive so only the exact slug is accepted', () => {
		expect(toOAuthProviderSlug('Google')).toBeUndefined();
		expect(toOAuthProviderSlug('GOOGLE')).toBeUndefined();
	});

	it('does not resolve inherited Object properties to a provider', () => {
		expect(toOAuthProviderSlug('constructor')).toBeUndefined();
		expect(toOAuthProviderSlug('toString')).toBeUndefined();
		expect(toOAuthProviderSlug('__proto__')).toBeUndefined();
	});
});

describe('getOAuthAuthorizationUrl', () => {
	it('returns null when WorkOS is not configured', () => {
		expect(getOAuthAuthorizationUrl('http://localhost:5173', 'google', 'csrf-state-nonce')).toBeNull();
	});

	it('returns null when state is empty even if a provider is valid', () => {
		expect(getOAuthAuthorizationUrl('http://localhost:5173', 'google', '')).toBeNull();
	});
});

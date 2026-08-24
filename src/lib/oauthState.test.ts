import { describe, expect, it, vi } from 'vitest';
import {
	AUTH_OAUTH_STATE_COOKIE,
	consumeOAuthState,
	generateOAuthState,
	oauthStateEquals
} from './oauthState';

describe('generateOAuthState', () => {
	it('returns a 32-byte nonce encoded as unpadded base64url', () => {
		const state = generateOAuthState();
		expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(Buffer.from(state, 'base64url').byteLength).toBe(32);
	});

	it('returns a different value on each call', () => {
		expect(generateOAuthState()).not.toBe(generateOAuthState());
	});
});

describe('oauthStateEquals', () => {
	it('returns true for identical non-empty strings', () => {
		const nonce = generateOAuthState();
		expect(oauthStateEquals(nonce, nonce)).toBe(true);
		expect(oauthStateEquals('same-length-value', 'same-length-value')).toBe(true);
	});

	it('returns false for same-length strings that differ', () => {
		expect(oauthStateEquals('aaaaaaaa', 'bbbbbbbb')).toBe(false);
	});

	it('returns false when lengths differ without calling timingSafeEqual', () => {
		expect(oauthStateEquals('short', 'much-longer-value')).toBe(false);
		expect(oauthStateEquals('much-longer-value', 'short')).toBe(false);
	});

	it('returns false when either value is missing or empty', () => {
		expect(oauthStateEquals(undefined, 'token')).toBe(false);
		expect(oauthStateEquals('token', undefined)).toBe(false);
		expect(oauthStateEquals(null, 'token')).toBe(false);
		expect(oauthStateEquals('token', null)).toBe(false);
		expect(oauthStateEquals('', 'token')).toBe(false);
		expect(oauthStateEquals('token', '')).toBe(false);
		expect(oauthStateEquals('', '')).toBe(false);
		expect(oauthStateEquals(undefined, undefined)).toBe(false);
		expect(oauthStateEquals(null, null)).toBe(false);
	});
});

describe('consumeOAuthState', () => {
	it('accepts a matching cookie and query state, then deletes the cookie', () => {
		const nonce = generateOAuthState();
		const cookies = {
			get: vi.fn(() => nonce),
			set: vi.fn(),
			delete: vi.fn()
		};

		expect(consumeOAuthState(cookies, nonce)).toBe(true);
		expect(cookies.get).toHaveBeenCalledWith(AUTH_OAUTH_STATE_COOKIE);
		expect(cookies.delete).toHaveBeenCalledWith(AUTH_OAUTH_STATE_COOKIE, { path: '/' });
	});

	it('rejects a mismatch and still deletes the cookie', () => {
		const cookies = {
			get: vi.fn(() => 'cookie-nonce-value'),
			set: vi.fn(),
			delete: vi.fn()
		};

		expect(consumeOAuthState(cookies, 'other-nonce-value')).toBe(false);
		expect(cookies.delete).toHaveBeenCalledWith(AUTH_OAUTH_STATE_COOKIE, { path: '/' });
	});

	it('rejects a missing cookie or query state and still deletes the cookie', () => {
		const cookies = {
			get: vi.fn<() => string | undefined>(() => undefined),
			set: vi.fn(),
			delete: vi.fn()
		};

		expect(consumeOAuthState(cookies, 'query-nonce')).toBe(false);
		expect(cookies.delete).toHaveBeenCalledWith(AUTH_OAUTH_STATE_COOKIE, { path: '/' });

		cookies.get.mockReturnValue('cookie-nonce');
		expect(consumeOAuthState(cookies, null)).toBe(false);
		expect(cookies.delete).toHaveBeenCalledTimes(2);
	});
});

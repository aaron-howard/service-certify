import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const AUTH_OAUTH_STATE_COOKIE = 'auth_oauth_state';
export const AUTH_OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

const STATE_BYTE_LENGTH = 32;

type OAuthStateCookies = Pick<Cookies, 'get' | 'set' | 'delete'>;

/** Cryptographically random CSRF nonce for the OAuth `state` parameter (32 bytes, base64url). */
export function generateOAuthState(): string {
	return randomBytes(STATE_BYTE_LENGTH).toString('base64url');
}

/**
 * Timing-safe comparison of OAuth `state` values.
 * Returns false when either value is missing, empty, or a different length.
 */
export function oauthStateEquals(
	expected: string | undefined | null,
	actual: string | undefined | null
): boolean {
	if (typeof expected !== 'string' || typeof actual !== 'string') return false;
	if (expected.length === 0 || actual.length === 0) return false;

	const expectedBuf = Buffer.from(expected, 'utf8');
	const actualBuf = Buffer.from(actual, 'utf8');
	if (expectedBuf.length !== actualBuf.length) return false;

	return timingSafeEqual(expectedBuf, actualBuf);
}

export function oauthStateCookieOptions(secure: boolean) {
	return {
		httpOnly: true,
		secure,
		sameSite: 'lax' as const,
		path: '/',
		maxAge: AUTH_OAUTH_STATE_MAX_AGE_SECONDS
	};
}

export function setOAuthStateCookie(cookies: OAuthStateCookies, state: string, secure: boolean) {
	cookies.set(AUTH_OAUTH_STATE_COOKIE, state, oauthStateCookieOptions(secure));
}

/**
 * Reads the stored nonce, always clears the cookie, then compares it to the query `state`.
 * Call this before exchanging an authorization code.
 */
export function consumeOAuthState(
	cookies: OAuthStateCookies,
	queryState: string | null | undefined
): boolean {
	const cookieState = cookies.get(AUTH_OAUTH_STATE_COOKIE);
	cookies.delete(AUTH_OAUTH_STATE_COOKIE, { path: '/' });
	return oauthStateEquals(cookieState, queryState);
}

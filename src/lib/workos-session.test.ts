import type { Cookies } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import {
	getJwtAuthTimeSeconds,
	getJwtExpirySeconds,
	isAccessTokenExpired,
	isRecentAuthentication,
	resolveWorkOsSession,
	WORKOS_ACCESS_COOKIE,
	WORKOS_USER_COOKIE
} from './workos-session';

function mockCookies(overrides: Partial<Pick<Cookies, 'get' | 'set' | 'delete'>>): Cookies {
	return {
		get: overrides.get ?? (() => undefined),
		set: overrides.set ?? (() => undefined),
		delete: overrides.delete ?? (() => undefined),
		getAll: () => [],
		serialize: () => ''
	};
}

function jwtWithClaims(claims: Record<string, unknown>): string {
	const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
	const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
	return `${header}.${payload}.sig`;
}

function jwtWithExp(exp: number): string {
	return jwtWithClaims({ exp });
}

describe('workos-session', () => {
	it('reads exp from a JWT payload', () => {
		const exp = Math.floor(Date.now() / 1000) + 3600;
		expect(getJwtExpirySeconds(jwtWithExp(exp))).toBe(exp);
	});

	it('treats malformed tokens as expired', () => {
		expect(isAccessTokenExpired('not-a-jwt')).toBe(true);
	});

	it('detects expired access tokens', () => {
		const exp = Math.floor(Date.now() / 1000) - 60;
		expect(isAccessTokenExpired(jwtWithExp(exp))).toBe(true);
	});

	it('accepts valid access tokens', () => {
		const exp = Math.floor(Date.now() / 1000) + 3600;
		expect(isAccessTokenExpired(jwtWithExp(exp))).toBe(false);
	});

	it('reads auth_time from a JWT payload', () => {
		const authTime = 1_700_000_000;
		expect(getJwtAuthTimeSeconds(jwtWithClaims({ auth_time: authTime }))).toBe(authTime);
	});

	it('treats missing auth_time as stale', () => {
		expect(isRecentAuthentication(jwtWithClaims({ exp: Date.now() / 1000 + 3600 }), 300)).toBe(
			false
		);
	});

	it('accepts recent auth_time within max age', () => {
		const authTime = Math.floor(Date.now() / 1000) - 60;
		expect(isRecentAuthentication(jwtWithClaims({ auth_time: authTime }), 300)).toBe(true);
	});

	it('rejects auth_time outside max age', () => {
		const authTime = Math.floor(Date.now() / 1000) - 600;
		expect(isRecentAuthentication(jwtWithClaims({ auth_time: authTime }), 300)).toBe(false);
	});

	it('resolveWorkOsSession returns null when no auth cookies are set', async () => {
		await expect(resolveWorkOsSession(mockCookies({}), false)).resolves.toBeNull();
	});

	it('resolveWorkOsSession returns a valid access token without refresh', async () => {
		const exp = Math.floor(Date.now() / 1000) + 3600;
		const accessToken = jwtWithExp(exp);
		const cookies = mockCookies({
			get: (name) => {
				if (name === WORKOS_ACCESS_COOKIE) return accessToken;
				if (name === WORKOS_USER_COOKIE) return 'user_01TEST';
				return undefined;
			}
		});
		await expect(resolveWorkOsSession(cookies, false)).resolves.toEqual({
			accessToken,
			userId: 'user_01TEST'
		});
	});
});

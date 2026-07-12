import { describe, expect, it } from 'vitest';
import {
	getJwtAuthTimeSeconds,
	getJwtExpirySeconds,
	isAccessTokenExpired,
	isRecentAuthentication
} from './workos-session';

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
});

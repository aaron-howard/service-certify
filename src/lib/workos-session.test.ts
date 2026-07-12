import { describe, expect, it } from 'vitest';
import { getJwtExpirySeconds, isAccessTokenExpired } from './workos-session';

function jwtWithExp(exp: number): string {
	const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
	const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
	return `${header}.${payload}.sig`;
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
});

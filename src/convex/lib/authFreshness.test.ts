import { describe, expect, it } from 'vitest';
import {
	DELETE_ACCOUNT_MAX_AGE_SECONDS,
	authTimeSecondsFromIdentity,
	isAuthTimeFresh
} from './authFreshness';

describe('isAuthTimeFresh', () => {
	const now = 1_700_000_000;
	const maxAge = DELETE_ACCOUNT_MAX_AGE_SECONDS;

	it('treats missing auth_time as stale', () => {
		expect(isAuthTimeFresh(undefined, now, maxAge)).toBe(false);
	});

	it('treats non-finite auth_time as stale', () => {
		expect(isAuthTimeFresh(Number.NaN, now, maxAge)).toBe(false);
		expect(isAuthTimeFresh(Number.POSITIVE_INFINITY, now, maxAge)).toBe(false);
	});

	it('accepts auth_time within max age', () => {
		expect(isAuthTimeFresh(now - 60, now, maxAge)).toBe(true);
	});

	it('accepts auth_time exactly at max age', () => {
		expect(isAuthTimeFresh(now - maxAge, now, maxAge)).toBe(true);
	});

	it('rejects auth_time older than max age', () => {
		expect(isAuthTimeFresh(now - maxAge - 1, now, maxAge)).toBe(false);
	});

	it('treats future auth_time as fresh (clock skew)', () => {
		expect(isAuthTimeFresh(now + 30, now, maxAge)).toBe(true);
	});

	it('rejects a negative max-age window', () => {
		expect(isAuthTimeFresh(now, now, -1)).toBe(false);
	});
});

describe('authTimeSecondsFromIdentity', () => {
	it('reads auth_time', () => {
		expect(authTimeSecondsFromIdentity({ auth_time: 123 })).toBe(123);
	});

	it('reads authTime when auth_time is absent', () => {
		expect(authTimeSecondsFromIdentity({ authTime: 456 })).toBe(456);
	});

	it('returns undefined when missing or not a finite number', () => {
		expect(authTimeSecondsFromIdentity({})).toBeUndefined();
		expect(authTimeSecondsFromIdentity({ auth_time: '1700000000' })).toBeUndefined();
		expect(authTimeSecondsFromIdentity({ auth_time: Number.NaN })).toBeUndefined();
	});
});

describe('DELETE_ACCOUNT_MAX_AGE_SECONDS', () => {
	it('matches the SvelteKit step-up window (5 minutes)', () => {
		expect(DELETE_ACCOUNT_MAX_AGE_SECONDS).toBe(300);
	});
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAdminEmail, parseAdminEmailAllowlist } from './adminEmails';
import { resolveUserRole, SAMPLE_QUESTION_LIMIT } from './authorization';

describe('admin email allowlist', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('matches admin emails case-insensitively from ADMIN_EMAILS', () => {
		vi.stubEnv('ADMIN_EMAILS', ' Admin@Example.com,other@test.org ');
		expect(isAdminEmail('admin@example.com')).toBe(true);
		expect(isAdminEmail('other@test.org')).toBe(true);
		expect(isAdminEmail('not-listed@example.com')).toBe(false);
	});

	it('strips wrapping quotes from env entries', () => {
		vi.stubEnv('ADMIN_EMAILS', '"mr.aaronjhoward@outlook.com"');
		expect(isAdminEmail('mr.aaronjhoward@outlook.com')).toBe(true);
	});

	it('parses comma and semicolon separated lists', () => {
		expect(parseAdminEmailAllowlist('a@x.com; b@y.com, c@z.com')).toEqual([
			'a@x.com',
			'b@y.com',
			'c@z.com'
		]);
	});
});

describe('authorization helpers', () => {
	it('defaults missing roles to user', () => {
		expect(resolveUserRole(undefined)).toBe('user');
		expect(resolveUserRole('admin')).toBe('admin');
	});

	it('documents the sample question limit', () => {
		expect(SAMPLE_QUESTION_LIMIT).toBe(3);
	});
});

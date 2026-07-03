import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAdminEmail, resolveUserRole, SAMPLE_QUESTION_LIMIT } from './authorization';

describe('authorization helpers', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('matches admin emails case-insensitively from ADMIN_EMAILS', () => {
		vi.stubEnv('ADMIN_EMAILS', ' Admin@Example.com,other@test.org ');
		expect(isAdminEmail('admin@example.com')).toBe(true);
		expect(isAdminEmail('other@test.org')).toBe(true);
		expect(isAdminEmail('not-listed@example.com')).toBe(false);
	});

	it('defaults missing roles to user', () => {
		expect(resolveUserRole(undefined)).toBe('user');
		expect(resolveUserRole('admin')).toBe('admin');
	});

	it('documents the sample question limit', () => {
		expect(SAMPLE_QUESTION_LIMIT).toBe(3);
	});
});

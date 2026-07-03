import { describe, expect, it } from 'vitest';
import { resolveWorkOSDisplayName } from '$lib/workos-user';

describe('resolveWorkOSDisplayName', () => {
	it('prefers first and last name when present', () => {
		expect(
			resolveWorkOSDisplayName({
				email: 'user@example.com',
				firstName: 'Aaron',
				lastName: 'Howard'
			})
		).toBe('Aaron Howard');
	});

	it('uses WorkOS full name when Microsoft omits first/last', () => {
		expect(
			resolveWorkOSDisplayName({
				email: 'mr.aaronjhoward@outlook.com',
				name: 'Aaron Howard'
			})
		).toBe('Aaron Howard');
	});

	it('formats the email local part when OAuth sends no name fields', () => {
		expect(
			resolveWorkOSDisplayName({
				email: 'mr.aaronjhoward@outlook.com'
			})
		).toBe('Mr Aaronjhoward');
	});
});

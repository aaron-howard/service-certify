import { describe, expect, it } from 'vitest';
import { canonicalAuthEmail, workosUserIdFromIdentity } from './workosIdentity';

describe('workosIdentity', () => {
	it('reads WorkOS user id from identity.subject', () => {
		expect(
			workosUserIdFromIdentity({
				subject: 'user_01K9TM4XJ99TD2SJ9XGZCGK9VR',
				tokenIdentifier: 'https://api.workos.com/user_management/client_01|user_01K9TM4XJ99TD2SJ9XGZCGK9VR',
				issuer: 'https://api.workos.com/user_management/client_01'
			})
		).toBe('user_01K9TM4XJ99TD2SJ9XGZCGK9VR');
	});

	it('falls back to tokenIdentifier suffix when subject is not a user id', () => {
		expect(
			workosUserIdFromIdentity({
				subject: 'https://api.workos.com/user_management/client_01|user_01KACW1B6XA3FS8TWAZPYF26DD',
				tokenIdentifier:
					'https://api.workos.com/user_management/client_01|user_01KACW1B6XA3FS8TWAZPYF26DD',
				issuer: 'https://api.workos.com/user_management/client_01'
			})
		).toBe('user_01KACW1B6XA3FS8TWAZPYF26DD');
	});

	it('prefers JWT email for admin bootstrap when present', () => {
		expect(
			canonicalAuthEmail(
				{
					subject: 'user_01',
					tokenIdentifier: 'issuer|user_01',
					issuer: 'issuer',
					email: 'mr.aaronjhoward@gmail.com'
				},
				'profile@example.com'
			)
		).toBe('mr.aaronjhoward@gmail.com');
	});
});

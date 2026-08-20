import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ensureConvexUser,
	getConvexCurrentUser,
	listProgressForCurrentUser,
	resolveConvexUser,
	type ConvexServerDeps
} from './convex.server';

function jwtWithExp(secondsFromNow: number): string {
	const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
	const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
	return `hdr.${payload}.sig`;
}

describe('convex.server helpers', () => {
	const queryMock = vi.fn();
	const mutationMock = vi.fn();

	const deps: ConvexServerDeps = {
		createAuthedClient: () => ({
			query: queryMock,
			mutation: mutationMock
		})
	};

	beforeEach(() => {
		queryMock.mockReset();
		mutationMock.mockReset();
	});

	it('getConvexCurrentUser returns a mapped session without mutating', async () => {
		queryMock.mockResolvedValueOnce({
			email: 'a@example.com',
			name: 'Ada',
			role: 'admin',
			profileImage: 'https://img.example/a.png',
			provider: 'google'
		});
		const result = await getConvexCurrentUser(jwtWithExp(3600), deps);
		expect(result).toEqual({
			role: 'admin',
			email: 'a@example.com',
			name: 'Ada',
			profileImage: 'https://img.example/a.png',
			provider: 'google'
		});
		expect(mutationMock).not.toHaveBeenCalled();
	});

	it('resolveConvexUser skips mutation when the user already exists', async () => {
		queryMock.mockResolvedValueOnce({
			email: 'a@example.com',
			name: 'Ada',
			role: 'user'
		});
		const result = await resolveConvexUser(
			{
				workosId: 'user_1',
				email: 'a@example.com',
				workosToken: jwtWithExp(3600)
			},
			deps
		);
		expect(result.role).toBe('user');
		expect(mutationMock).not.toHaveBeenCalled();
	});

	it('resolveConvexUser mutates when Convex has no row', async () => {
		queryMock.mockResolvedValueOnce(null);
		mutationMock.mockResolvedValueOnce({
			role: 'user',
			name: 'Ada',
			profileImage: undefined,
			provider: 'google'
		});
		const result = await resolveConvexUser(
			{
				workosId: 'user_1',
				email: 'a@example.com',
				name: 'Ada',
				provider: 'google',
				workosToken: jwtWithExp(3600)
			},
			deps
		);
		expect(result).toMatchObject({ role: 'user', name: 'Ada', email: 'a@example.com' });
		expect(mutationMock).toHaveBeenCalledOnce();
	});

	it('listProgressForCurrentUser returns Convex rows', async () => {
		const rows = [
			{
				trackCode: 'CSA',
				sessionsCompleted: 2,
				bestScore: 90,
				averageScore: 80,
				lastAttemptedAt: 1
			}
		];
		queryMock.mockResolvedValueOnce(rows);
		await expect(listProgressForCurrentUser(jwtWithExp(3600), deps)).resolves.toEqual(rows);
	});

	it('returns empty progress when the access token is expired', async () => {
		const createAuthedClient = vi.fn();
		await expect(
			listProgressForCurrentUser(jwtWithExp(-60), { createAuthedClient })
		).resolves.toEqual([]);
		expect(createAuthedClient).not.toHaveBeenCalled();
	});

	it('ensureConvexUser returns profile fields when token is expired', async () => {
		const result = await ensureConvexUser({
			workosId: 'user_1',
			email: 'a@example.com',
			name: 'Ada',
			workosToken: jwtWithExp(-60)
		});
		expect(result).toMatchObject({
			role: 'user',
			email: 'a@example.com',
			name: 'Ada'
		});
	});
});

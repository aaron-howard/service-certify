import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock, setAuthMock, ConvexHttpClientMock } = vi.hoisted(() => {
	const queryMock = vi.fn();
	const mutationMock = vi.fn();
	const setAuthMock = vi.fn();
	const ConvexHttpClientMock = vi.fn(function MockClient() {
		return {
			setAuth: setAuthMock,
			query: queryMock,
			mutation: mutationMock
		};
	});
	return { queryMock, mutationMock, setAuthMock, ConvexHttpClientMock };
});

vi.mock('convex/browser', () => ({
	ConvexHttpClient: ConvexHttpClientMock
}));

vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_CONVEX_URL: 'https://example.convex.cloud' }
}));

vi.mock('$convex/_generated/api', () => ({
	api: {
		auth: {
			getCurrentUser: 'auth:getCurrentUser',
			createOrUpdateUser: 'auth:createOrUpdateUser'
		},
		userProgress: {
			listForCurrentUser: 'userProgress:listForCurrentUser'
		}
	}
}));

function jwtWithExp(secondsFromNow: number): string {
	const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
	const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
	return `hdr.${payload}.sig`;
}

describe('convex.server helpers', () => {
	beforeEach(() => {
		queryMock.mockReset();
		mutationMock.mockReset();
		setAuthMock.mockReset();
		ConvexHttpClientMock.mockClear();
	});

	afterEach(() => {
		vi.resetModules();
	});

	it('getConvexCurrentUser returns a mapped session without mutating', async () => {
		queryMock.mockResolvedValueOnce({
			email: 'a@example.com',
			name: 'Ada',
			role: 'admin',
			profileImage: 'https://img.example/a.png',
			provider: 'google'
		});
		const { getConvexCurrentUser } = await import('./convex.server');
		const result = await getConvexCurrentUser(jwtWithExp(3600));
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
		const { resolveConvexUser } = await import('./convex.server');
		const result = await resolveConvexUser({
			workosId: 'user_1',
			email: 'a@example.com',
			workosToken: jwtWithExp(3600)
		});
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
		const { resolveConvexUser } = await import('./convex.server');
		const result = await resolveConvexUser({
			workosId: 'user_1',
			email: 'a@example.com',
			name: 'Ada',
			provider: 'google',
			workosToken: jwtWithExp(3600)
		});
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
		const { listProgressForCurrentUser } = await import('./convex.server');
		await expect(listProgressForCurrentUser(jwtWithExp(3600))).resolves.toEqual(rows);
	});

	it('returns empty progress when the access token is expired', async () => {
		const { listProgressForCurrentUser } = await import('./convex.server');
		await expect(listProgressForCurrentUser(jwtWithExp(-60))).resolves.toEqual([]);
		expect(ConvexHttpClientMock).not.toHaveBeenCalled();
	});
});

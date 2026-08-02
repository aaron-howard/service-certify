import { afterEach, describe, expect, it, vi } from 'vitest';

const getConvexCurrentUser = vi.fn();
const resolveConvexUser = vi.fn();
const getUser = vi.fn();

vi.mock('$lib/convex.server', () => ({
	getConvexCurrentUser: (...args: unknown[]) => getConvexCurrentUser(...args),
	resolveConvexUser: (...args: unknown[]) => resolveConvexUser(...args)
}));

vi.mock('$lib/workos.server', () => ({
	getWorkOS: () => ({
		userManagement: { getUser }
	})
}));

describe('getSessionUser', () => {
	afterEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('uses Convex profile without calling WorkOS when the user row exists', async () => {
		getConvexCurrentUser.mockResolvedValueOnce({
			role: 'admin',
			email: 'ada@example.com',
			name: 'Ada Lovelace',
			profileImage: undefined,
			provider: 'google'
		});
		const { getSessionUser } = await import('./auth.server');
		const user = await getSessionUser({
			workosUserId: 'user_1',
			workosToken: 'token'
		} as App.Locals);

		expect(user).toEqual({
			id: 'user_1',
			email: 'ada@example.com',
			name: 'Ada Lovelace',
			role: 'admin',
			isAdmin: true,
			profileImage: undefined,
			provider: 'google'
		});
		expect(getUser).not.toHaveBeenCalled();
		expect(resolveConvexUser).not.toHaveBeenCalled();
	});

	it('bootstraps via WorkOS + Convex when no Convex row exists', async () => {
		getConvexCurrentUser.mockResolvedValueOnce(null);
		getUser.mockResolvedValueOnce({
			id: 'user_1',
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
			profilePictureUrl: null
		});
		resolveConvexUser.mockResolvedValueOnce({
			role: 'user',
			name: 'Ada Lovelace',
			profileImage: undefined,
			provider: undefined
		});

		const { getSessionUser } = await import('./auth.server');
		const user = await getSessionUser({
			workosUserId: 'user_1',
			workosToken: 'token'
		} as App.Locals);

		expect(getUser).toHaveBeenCalledWith('user_1');
		expect(resolveConvexUser).toHaveBeenCalledOnce();
		expect(user?.email).toBe('ada@example.com');
		expect(user?.isAdmin).toBe(false);
	});

	it('returns null when session cookies are missing', async () => {
		const { getSessionUser } = await import('./auth.server');
		await expect(getSessionUser({} as App.Locals)).resolves.toBeNull();
	});
});

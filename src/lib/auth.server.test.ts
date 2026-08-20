import { describe, expect, it, vi } from 'vitest';
import { getSessionUser, type SessionUserDeps } from './auth.server';

describe('getSessionUser', () => {
	it('uses Convex profile without calling WorkOS when the user row exists', async () => {
		const getUser = vi.fn();
		const deps: SessionUserDeps = {
			getConvexCurrentUser: vi.fn().mockResolvedValue({
				role: 'admin',
				email: 'ada@example.com',
				name: 'Ada Lovelace',
				profileImage: undefined,
				provider: 'google'
			}),
			resolveConvexUser: vi.fn(),
			getWorkOS: () => ({ userManagement: { getUser } })
		};

		const user = await getSessionUser(
			{ workosUserId: 'user_1', workosToken: 'token' },
			deps
		);

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
		expect(deps.resolveConvexUser).not.toHaveBeenCalled();
	});

	it('bootstraps via WorkOS + Convex when no Convex row exists', async () => {
		const getUser = vi.fn().mockResolvedValue({
			id: 'user_1',
			email: 'ada@example.com',
			firstName: 'Ada',
			lastName: 'Lovelace',
			profilePictureUrl: null
		});
		const resolveConvexUser = vi.fn().mockResolvedValue({
			role: 'user',
			name: 'Ada Lovelace',
			profileImage: undefined,
			provider: undefined
		});
		const deps: SessionUserDeps = {
			getConvexCurrentUser: vi.fn().mockResolvedValue(null),
			resolveConvexUser,
			getWorkOS: () => ({ userManagement: { getUser } })
		};

		const user = await getSessionUser(
			{ workosUserId: 'user_1', workosToken: 'token' },
			deps
		);

		expect(getUser).toHaveBeenCalledWith('user_1');
		expect(resolveConvexUser).toHaveBeenCalledOnce();
		expect(user?.email).toBe('ada@example.com');
		expect(user?.isAdmin).toBe(false);
	});

	it('returns null when session cookies are missing', async () => {
		await expect(getSessionUser({})).resolves.toBeNull();
	});
});

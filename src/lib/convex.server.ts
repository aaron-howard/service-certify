import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';
import { isAccessTokenExpired } from '$lib/workos-session';

export type ConvexUserSession = {
	role: 'user' | 'admin';
	email?: string;
	name?: string;
	profileImage?: string;
	provider?: string;
};

export type ConvexUserSyncArgs = {
	workosId: string;
	email: string;
	name?: string;
	profileImage?: string;
	provider?: string;
	/** WorkOS access token — required so Convex can verify identity via setAuth. */
	workosToken: string;
};

export type UserProgressRow = {
	trackCode: string;
	sessionsCompleted: number;
	bestScore: number;
	averageScore: number;
	lastAttemptedAt: number;
};

/** Fresh HTTP client per call so setAuth cannot race across concurrent requests. */
function createAuthedClient(workosToken: string): ConvexHttpClient | null {
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return null;
	}
	const client = new ConvexHttpClient(convexUrl);
	client.setAuth(workosToken);
	return client;
}

/** Read-only current user from Convex (no mutation). */
export async function getConvexCurrentUser(
	workosToken: string
): Promise<ConvexUserSession | null> {
	if (isAccessTokenExpired(workosToken)) return null;
	const convex = createAuthedClient(workosToken);
	if (!convex) return null;

	try {
		const user = await convex.query(api.auth.getCurrentUser, {});
		if (!user) return null;
		const role: ConvexUserSession['role'] = user.role === 'admin' ? 'admin' : 'user';
		return {
			role,
			email: user.email,
			name: user.name,
			profileImage: user.profileImage,
			provider: user.provider
		};
	} catch (error) {
		console.error('getConvexCurrentUser failed:', error);
		return null;
	}
}

/** Practice progress for the signed-in user (SSR dashboard). */
export async function listProgressForCurrentUser(
	workosToken: string
): Promise<UserProgressRow[]> {
	if (isAccessTokenExpired(workosToken)) return [];
	const convex = createAuthedClient(workosToken);
	if (!convex) return [];

	try {
		return await convex.query(api.userProgress.listForCurrentUser, {});
	} catch (error) {
		console.error('listProgressForCurrentUser failed:', error);
		return [];
	}
}

export async function syncUserToConvex(args: ConvexUserSyncArgs): Promise<void> {
	const { workosToken, ...profile } = args;
	const convex = createAuthedClient(workosToken);
	if (!convex) {
		console.error(
			'syncUserToConvex skipped: PUBLIC_CONVEX_URL is not set in SvelteKit env (.env.local or Vercel env vars)'
		);
		return;
	}

	try {
		await convex.mutation(api.auth.createOrUpdateUser, profile);
	} catch (error) {
		console.error('syncUserToConvex failed:', error);
		throw error;
	}
}

/**
 * Prefer a read-only Convex lookup; only mutate when the user row is missing.
 * Cuts layout TTFB by avoiding createOrUpdateUser on every authenticated page load.
 */
export async function resolveConvexUser(args: ConvexUserSyncArgs): Promise<ConvexUserSession> {
	const existing = await getConvexCurrentUser(args.workosToken);
	if (existing) return existing;
	return ensureConvexUser(args);
}

/** Sync profile to Convex and return the stored user (creates or updates). */
export async function ensureConvexUser(args: ConvexUserSyncArgs): Promise<ConvexUserSession> {
	const { workosToken, ...profile } = args;
	if (isAccessTokenExpired(workosToken)) {
		return {
			role: 'user',
			email: profile.email,
			name: profile.name,
			profileImage: profile.profileImage,
			provider: profile.provider
		};
	}
	const convex = createAuthedClient(workosToken);
	if (!convex) return { role: 'user', email: profile.email };

	const baseSession = {
		email: profile.email,
		name: profile.name,
		profileImage: profile.profileImage,
		provider: profile.provider
	};

	try {
		const result = await convex.mutation(api.auth.createOrUpdateUser, profile);
		const role: ConvexUserSession['role'] = result.role === 'admin' ? 'admin' : 'user';
		return {
			role,
			email: profile.email,
			name: result.name ?? profile.name,
			profileImage: result.profileImage ?? profile.profileImage,
			provider: result.provider ?? profile.provider
		};
	} catch (mutationError) {
		console.error('ensureConvexUser mutation failed:', mutationError);
		// Fall back to stored role when profile sync fails but JWT auth still works.
		try {
			const user = await convex.query(api.auth.getCurrentUser, {});
			if (user) {
				const role: ConvexUserSession['role'] = user.role === 'admin' ? 'admin' : 'user';
				return {
					role,
					email: user.email ?? profile.email,
					name: user.name ?? profile.name,
					profileImage: user.profileImage ?? profile.profileImage,
					provider: user.provider ?? profile.provider
				};
			}
		} catch (queryError) {
			console.error('ensureConvexUser getCurrentUser fallback failed:', queryError);
		}
		return { role: 'user', ...baseSession };
	}
}

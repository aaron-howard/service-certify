import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';

export type ConvexUserSession = {
	role: 'user' | 'admin';
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

/** Sync profile to Convex and return the stored user (creates or updates every time). */
export async function ensureConvexUser(args: ConvexUserSyncArgs): Promise<ConvexUserSession> {
	const { workosToken, ...profile } = args;
	const convex = createAuthedClient(workosToken);
	if (!convex) return { role: 'user' };

	try {
		const result = await convex.mutation(api.auth.createOrUpdateUser, profile);
		const role: ConvexUserSession['role'] = result.role === 'admin' ? 'admin' : 'user';
		return {
			role,
			name: result.name ?? profile.name,
			profileImage: result.profileImage ?? profile.profileImage,
			provider: result.provider ?? profile.provider
		};
	} catch (error) {
		console.error('ensureConvexUser failed:', error);
		return {
			role: 'user',
			name: profile.name,
			profileImage: profile.profileImage,
			provider: profile.provider
		};
	}
}

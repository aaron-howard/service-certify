import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';

let client: ConvexHttpClient | null = null;
let clientUrl: string | null = null;

export type ConvexUserSession = {
	role: 'user' | 'admin';
	name?: string;
	profileImage?: string;
	provider?: string;
};

/** Server-side Convex HTTP client for auth sync and session role lookup. */
export function getConvexHttpClient(): ConvexHttpClient | null {
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return null;
	}

	if (!client || clientUrl !== convexUrl) {
		client = new ConvexHttpClient(convexUrl);
		clientUrl = convexUrl;
	}
	return client;
}

export async function syncUserToConvex(args: {
	workosId: string;
	email: string;
	name?: string;
	profileImage?: string;
	provider?: string;
}): Promise<void> {
	const convex = getConvexHttpClient();
	if (!convex) {
		console.error(
			'syncUserToConvex skipped: PUBLIC_CONVEX_URL is not set in SvelteKit env (.env.local or Vercel env vars)'
		);
		return;
	}

	try {
		await convex.mutation(api.auth.createOrUpdateUser, args);
	} catch (error) {
		console.error('syncUserToConvex failed:', error);
		throw error;
	}
}

/** Sync profile to Convex and return the stored user (creates or updates every time). */
export async function ensureConvexUser(args: {
	workosId: string;
	email: string;
	name?: string;
	profileImage?: string;
	provider?: string;
}): Promise<ConvexUserSession> {
	const convex = getConvexHttpClient();
	if (!convex) return { role: 'user' };

	try {
		await convex.mutation(api.auth.createOrUpdateUser, args);
		const user = await convex.query(api.auth.getUserByEmail, { email: args.email });
		return {
			role: user?.role ?? 'user',
			name: user?.name ?? args.name,
			profileImage: user?.profileImage ?? args.profileImage,
			provider: user?.provider ?? args.provider
		};
	} catch (error) {
		console.error('ensureConvexUser failed:', error);
		return { role: 'user', name: args.name, profileImage: args.profileImage, provider: args.provider };
	}
}

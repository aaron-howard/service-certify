import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';

let client: ConvexHttpClient | null = null;
let clientUrl: string | null = null;

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

export async function getUserRoleByEmail(email: string): Promise<'user' | 'admin'> {
	const convex = getConvexHttpClient();
	if (!convex) return 'user';

	try {
		const user = await convex.query(api.auth.getUserByEmail, { email });
		return user?.role ?? 'user';
	} catch (error) {
		console.error('getUserRoleByEmail failed:', error);
		return 'user';
	}
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

/** Create the Convex user row if missing (e.g. after fixing env or first login). */
export async function ensureConvexUser(args: {
	workosId: string;
	email: string;
	name?: string;
	profileImage?: string;
	provider?: string;
}): Promise<'user' | 'admin'> {
	const convex = getConvexHttpClient();
	if (!convex) return 'user';

	try {
		let user = await convex.query(api.auth.getUserByEmail, { email: args.email });
		if (!user) {
			await convex.mutation(api.auth.createOrUpdateUser, args);
			user = await convex.query(api.auth.getUserByEmail, { email: args.email });
		}
		return user?.role ?? 'user';
	} catch (error) {
		console.error('ensureConvexUser failed:', error);
		return 'user';
	}
}

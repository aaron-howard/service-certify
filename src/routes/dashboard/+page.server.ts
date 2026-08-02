import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env as publicEnv } from '$env/dynamic/public';
import { listProgressForCurrentUser } from '$lib/convex.server';

/** Dashboard requires sign-in; progress is loaded on the server for first-paint CWV. */
export const load: PageServerLoad = async ({ parent, locals, url }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(url.pathname)}`);
	}

	const convexConfigured =
		typeof publicEnv.PUBLIC_CONVEX_URL === 'string' && publicEnv.PUBLIC_CONVEX_URL.length > 0;

	const progress =
		convexConfigured && locals.workosToken
			? await listProgressForCurrentUser(locals.workosToken)
			: [];

	return { user, progress, convexConfigured };
};

import { resolveWorkOsSession } from '$lib/workos-session';
import type { RequestHandler } from '@sveltejs/kit';

/** Return the WorkOS access token from the httpOnly session cookie for Convex setAuth. */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const secure = url.protocol === 'https:';
	const session = await resolveWorkOsSession(cookies, secure);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store'
			}
		});
	}

	return new Response(JSON.stringify({ token: session.accessToken }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store'
		}
	});
};

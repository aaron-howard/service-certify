import type { RequestHandler } from '@sveltejs/kit';

/** Return the WorkOS access token from the httpOnly session cookie for Convex setAuth. */
export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('workos_token');
	if (!token) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store'
			}
		});
	}

	return new Response(JSON.stringify({ token }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store'
		}
	});
};

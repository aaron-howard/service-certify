import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	// Clear auth cookies
	cookies.delete('workos_token', { path: '/' });
	cookies.delete('workos_user_id', { path: '/' });

	// Redirect to home
	throw redirect(302, '/');
};

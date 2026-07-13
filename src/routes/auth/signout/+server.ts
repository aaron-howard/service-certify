import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearWorkOsAuthCookies } from '$lib/workos-session';

export const GET: RequestHandler = async ({ cookies }) => {
	clearWorkOsAuthCookies(cookies);
	throw redirect(302, '/');
};

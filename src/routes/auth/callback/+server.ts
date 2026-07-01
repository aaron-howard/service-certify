import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getWorkOS, getWorkOSClientId, isWorkOSConfigured } from '$lib/workos.server';

export const GET: RequestHandler = async ({ url, cookies }) => {
	if (!isWorkOSConfigured()) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	const workos = getWorkOS();
	const clientId = getWorkOSClientId();

	if (!workos || !clientId) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	if (error) {
		console.error('OAuth error:', error);
		throw redirect(302, `/auth/signin?error=${encodeURIComponent(error)}`);
	}

	if (!code) {
		console.error('No authorization code received');
		throw redirect(302, '/auth/signin?error=no_code');
	}

	const secure = url.protocol === 'https:';

	try {
		const token = await workos.userManagement.authenticateWithCode({
			code,
			clientId
		});

		cookies.set('workos_token', token.accessToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60
		});

		const user = await workos.userManagement.getUser(token.user.id);

		cookies.set('workos_user_id', user.id, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60
		});

		throw redirect(302, '/dashboard');
	} catch (err) {
		console.error('Token exchange error:', err);
		throw redirect(302, '/auth/signin?error=authentication_failed');
	}
};

import { WorkOS } from '@workos-inc/node';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const GET: RequestHandler = async ({ url, cookies }) => {
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

	try {
		// Exchange code for token
		const token = await workos.userManagement.authenticateWithCode({
			code,
			clientId: process.env.WORKOS_CLIENT_ID!
		});

		// Store token in cookie (will be used by Convex)
		cookies.set('workos_token', token.accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 // 7 days
		});

		// Get user info
		const user = await workos.userManagement.getUser(token.user.id);

		// Store user ID for Convex
		cookies.set('workos_user_id', user.id, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60
		});

		// Redirect to dashboard or home
		throw redirect(302, '/dashboard');
	} catch (error) {
		console.error('Token exchange error:', error);
		throw redirect(302, `/auth/signin?error=${encodeURIComponent('authentication_failed')}`);
	}
};

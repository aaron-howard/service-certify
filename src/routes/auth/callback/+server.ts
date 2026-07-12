import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getWorkOS, getWorkOSClientId, isWorkOSConfigured, type OAuthProviderSlug } from '$lib/workos.server';
import { buildConvexUserSyncPayload } from '$lib/auth.server';

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
	const stepUpIntent = cookies.get('auth_step_up_intent');

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

		const { syncUserToConvex } = await import('$lib/convex.server');
		const oauthProvider = cookies.get('auth_provider') as OAuthProviderSlug | undefined;
		if (oauthProvider) {
			cookies.delete('auth_provider', { path: '/' });
		}

		if (stepUpIntent) {
			cookies.delete('auth_step_up_intent', { path: '/' });
		}

		const syncPayload = buildConvexUserSyncPayload(user, oauthProvider);

		try {
			await syncUserToConvex({ ...syncPayload, workosToken: token.accessToken });
		} catch (syncError) {
			// OAuth succeeded; log sync failure but still sign the user in.
			console.error('Convex user sync failed after OAuth:', syncError);
			const { captureException } = await import('$lib/sentry');
			captureException(syncError, { phase: 'oauth_convex_sync' });
		}
	} catch (err) {
		console.error('Token exchange error:', err);
		throw redirect(302, '/auth/signin?error=authentication_failed');
	}

	const postAuthRedirect = cookies.get('auth_redirect');
	if (postAuthRedirect?.startsWith('/')) {
		cookies.delete('auth_redirect', { path: '/' });
		throw redirect(302, postAuthRedirect);
	}

	if (stepUpIntent === 'delete-account') {
		throw redirect(302, '/settings?step_up=delete-account');
	}

	throw redirect(302, '/dashboard');
};

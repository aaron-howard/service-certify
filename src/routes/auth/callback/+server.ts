import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	getWorkOS,
	getWorkOSClientId,
	isWorkOSConfigured,
	toOAuthProviderSlug
} from '$lib/workos.server';
import { buildConvexUserSyncPayload } from '$lib/auth.server';
import { setWorkOsAuthCookies } from '$lib/workos-session';

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

		const user = await workos.userManagement.getUser(token.user.id);

		setWorkOsAuthCookies(
			cookies,
			{
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				userId: user.id
			},
			secure
		);

		const { syncUserToConvex } = await import('$lib/convex.server');
		const rawOAuthProvider = cookies.get('auth_provider');
		const oauthProvider = toOAuthProviderSlug(rawOAuthProvider);
		if (rawOAuthProvider) {
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
			const { getJwtAuthDiagnostics } = await import('$lib/workos-session');
			const jwtDiagnostics = getJwtAuthDiagnostics(token.accessToken);
			const syncMessage =
				syncError instanceof Error
					? syncError.message
					: Object.prototype.toString.call(syncError) === '[object String]'
						? String(syncError)
						: '';
			captureException(syncError, {
				phase: 'oauth_convex_sync',
				errorCode: /NoAuthProvider/i.test(syncMessage) ? 'NoAuthProvider' : null,
				jwtIss: jwtDiagnostics.iss ?? null,
				// Never log the raw audience (it is the client ID); only whether it was present.
				jwtHasAud: jwtDiagnostics.hasAud,
				hint: !jwtDiagnostics.hasAud
					? 'WorkOS JWT missing aud claim; set JWT template aud to WORKOS_CLIENT_ID'
					: null
			});
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

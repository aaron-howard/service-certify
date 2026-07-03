import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	getOAuthAuthorizationUrl,
	isWorkOSConfigured,
	type OAuthProviderSlug,
	OAUTH_PROVIDERS
} from '$lib/workos.server';

export const GET: RequestHandler = async ({ url, cookies }) => {
	if (!isWorkOSConfigured()) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	const provider = url.searchParams.get('provider') as OAuthProviderSlug | null;

	if (!provider || !(provider in OAUTH_PROVIDERS)) {
		throw redirect(302, '/auth/signin?error=invalid_provider');
	}

	const postAuthRedirect = url.searchParams.get('redirect');
	if (postAuthRedirect?.startsWith('/')) {
		cookies.set('auth_redirect', postAuthRedirect, {
			httpOnly: true,
			secure: url.protocol === 'https:',
			sameSite: 'lax',
			path: '/',
			maxAge: 10 * 60
		});
	}

	cookies.set('auth_provider', provider, {
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		path: '/',
		maxAge: 10 * 60
	});

	const authorizationUrl = getOAuthAuthorizationUrl(url.origin, provider);

	if (!authorizationUrl) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	throw redirect(302, authorizationUrl);
};

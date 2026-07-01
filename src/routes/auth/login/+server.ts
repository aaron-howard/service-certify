import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	getOAuthAuthorizationUrl,
	isWorkOSConfigured,
	type OAuthProviderSlug,
	OAUTH_PROVIDERS
} from '$lib/workos.server';

export const GET: RequestHandler = async ({ url }) => {
	if (!isWorkOSConfigured()) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	const provider = url.searchParams.get('provider') as OAuthProviderSlug | null;

	if (!provider || !(provider in OAUTH_PROVIDERS)) {
		throw redirect(302, '/auth/signin?error=invalid_provider');
	}

	const authorizationUrl = getOAuthAuthorizationUrl(url.origin, provider);

	if (!authorizationUrl) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	throw redirect(302, authorizationUrl);
};

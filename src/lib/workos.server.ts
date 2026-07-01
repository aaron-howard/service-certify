import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';

/** Slugs used in `/auth/login?provider=` → WorkOS provider identifiers. */
export const OAUTH_PROVIDERS = {
	google: 'GoogleOAuth',
	microsoft: 'MicrosoftOAuth',
	github: 'GitHubOAuth'
} as const;

export type OAuthProviderSlug = keyof typeof OAUTH_PROVIDERS;

export function isWorkOSConfigured(): boolean {
	return Boolean(env.WORKOS_API_KEY && env.WORKOS_CLIENT_ID);
}

export function getWorkOS(): WorkOS | null {
	const apiKey = env.WORKOS_API_KEY;
	if (!apiKey) return null;
	return new WorkOS(apiKey);
}

export function getWorkOSClientId(): string | undefined {
	return env.WORKOS_CLIENT_ID;
}

export function workOSRedirectUri(origin: string): string {
	return `${origin}/auth/callback`;
}

export function getOAuthAuthorizationUrl(
	origin: string,
	provider: OAuthProviderSlug
): string | null {
	const workos = getWorkOS();
	const clientId = getWorkOSClientId();
	const workosProvider = OAUTH_PROVIDERS[provider];

	if (!workos || !clientId || !workosProvider) return null;

	return workos.userManagement.getAuthorizationUrl({
		clientId,
		provider: workosProvider,
		redirectUri: workOSRedirectUri(origin)
	});
}

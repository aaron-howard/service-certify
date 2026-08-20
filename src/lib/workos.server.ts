import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';

/** Slugs used in `/auth/login?provider=` → WorkOS provider identifiers. */
export const OAUTH_PROVIDERS = {
	google: 'GoogleOAuth',
	microsoft: 'MicrosoftOAuth'
} as const;

export type OAuthProviderSlug = keyof typeof OAUTH_PROVIDERS;

/**
 * Narrow untrusted input (query param, cookie) to a supported provider slug.
 *
 * `auth_provider` is httpOnly, but that only stops scripts from reading it — a client can
 * still send any value in the request header. Unknown values — including the legacy
 * `"github"` slug — become `undefined` so they are never persisted as a user's provider.
 *
 * Uses an own-property check: `in` would also match inherited keys like `constructor`.
 */
export function toOAuthProviderSlug(
	value: string | undefined | null
): OAuthProviderSlug | undefined {
	if (!value || !Object.hasOwn(OAUTH_PROVIDERS, value)) return undefined;
	// SAFETY: Object.hasOwn confirms value is a key of OAUTH_PROVIDERS.
	return value as OAuthProviderSlug;
}

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

/** AuthKit authorize URL for step-up (re-authentication). Requires `maxAge` on WorkOS AuthKit flows. */
export function getAuthKitStepUpAuthorizationUrl(
	origin: string,
	options: { maxAge: number; loginHint?: string; state?: string }
): string | null {
	const workos = getWorkOS();
	const clientId = getWorkOSClientId();
	if (!workos || !clientId) return null;

	return workos.userManagement.getAuthorizationUrl({
		clientId,
		provider: 'authkit',
		redirectUri: workOSRedirectUri(origin),
		maxAge: options.maxAge,
		loginHint: options.loginHint,
		state: options.state
	});
}

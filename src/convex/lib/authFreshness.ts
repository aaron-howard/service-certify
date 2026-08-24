/**
 * Auth-time freshness for sensitive mutations (account deletion).
 * Used from mutations only — do not call Date.now() inside Convex queries.
 */

/** Same window as SvelteKit `DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS`. */
export const DELETE_ACCOUNT_MAX_AGE_SECONDS = 300;

type IdentityAuthTimeClaims = {
	auth_time?: unknown;
	authTime?: unknown;
};

/**
 * Read OIDC `auth_time` (seconds since epoch) from a Convex identity.
 * WorkOS may mint `auth_time`; Convex may surface it as `authTime`.
 */
export function authTimeSecondsFromIdentity(identity: IdentityAuthTimeClaims): number | undefined {
	const raw = identity.auth_time ?? identity.authTime;
	if (typeof raw !== 'number' || !Number.isFinite(raw)) return undefined;
	return raw;
}

/**
 * True when `authTimeSeconds` is within `maxAgeSeconds` of `nowSeconds`.
 * Missing / non-finite auth_time is stale (fail closed).
 * Future auth_time is treated as fresh (clock skew), matching `isRecentAuthentication`.
 */
export function isAuthTimeFresh(
	authTimeSeconds: number | undefined,
	nowSeconds: number,
	maxAgeSeconds: number
): boolean {
	if (authTimeSeconds === undefined || !Number.isFinite(authTimeSeconds) || maxAgeSeconds < 0) {
		return false;
	}
	if (authTimeSeconds > nowSeconds) return true;
	return nowSeconds - authTimeSeconds <= maxAgeSeconds;
}

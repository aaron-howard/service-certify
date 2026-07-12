import type { Cookies } from '@sveltejs/kit';

type WorkOsAccessTokenPayload = {
	exp?: unknown;
	auth_time?: unknown;
};

function decodeJwtPayload(token: string): WorkOsAccessTokenPayload | null {
	const parts = token.split('.');
	if (parts.length < 2) return null;
	try {
		return JSON.parse(
			Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
		) as WorkOsAccessTokenPayload;
	} catch {
		return null;
	}
}

/** Decode JWT `exp` (seconds since epoch). Returns null if the payload cannot be read. */
export function getJwtExpirySeconds(token: string): number | null {
	const payload = decodeJwtPayload(token);
	return typeof payload?.exp === 'number' ? payload.exp : null;
}

/**
 * WorkOS OIDC `auth_time` — last interactive authentication (seconds since epoch).
 * Fails closed when missing or malformed.
 */
export function getJwtAuthTimeSeconds(token: string): number | null {
	const payload = decodeJwtPayload(token);
	return typeof payload?.auth_time === 'number' && Number.isFinite(payload.auth_time)
		? payload.auth_time
		: null;
}

/**
 * True when the access token's `auth_time` is within `maxAgeSeconds` of now.
 * Missing `auth_time` is treated as stale (fail closed).
 */
export function isRecentAuthentication(token: string, maxAgeSeconds: number): boolean {
	const authTime = getJwtAuthTimeSeconds(token);
	if (authTime === null || maxAgeSeconds < 0) return false;
	const nowSeconds = Date.now() / 1000;
	if (authTime > nowSeconds) return true;
	return nowSeconds - authTime <= maxAgeSeconds;
}

/** True when the access token is missing `exp` or is past expiry (with optional leeway). */
export function isAccessTokenExpired(token: string, leewaySeconds = 30): boolean {
	const exp = getJwtExpirySeconds(token);
	if (exp === null) return true;
	return Date.now() >= (exp - leewaySeconds) * 1000;
}

export function clearWorkOsAuthCookies(cookies: Cookies): void {
	cookies.delete('workos_token', { path: '/' });
	cookies.delete('workos_user_id', { path: '/' });
}

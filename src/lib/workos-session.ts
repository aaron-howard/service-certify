import type { Cookies } from '@sveltejs/kit';

/** Decode JWT `exp` (seconds since epoch). Returns null if the payload cannot be read. */
export function getJwtExpirySeconds(token: string): number | null {
	const parts = token.split('.');
	if (parts.length < 2) return null;
	try {
		const payload = JSON.parse(
			Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
		) as { exp?: unknown };
		return typeof payload.exp === 'number' ? payload.exp : null;
	} catch {
		return null;
	}
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

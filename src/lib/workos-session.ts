import type { Cookies } from '@sveltejs/kit';
import {
	isPlainObject,
	parseJsonValue,
	readFiniteNumber,
	readString,
	type JsonValue
} from './parse';

export const WORKOS_ACCESS_COOKIE = 'workos_token';
export const WORKOS_REFRESH_COOKIE = 'workos_refresh_token';
export const WORKOS_USER_COOKIE = 'workos_user_id';

const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const authCookieOptions = (secure: boolean) =>
	({
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
		maxAge: AUTH_COOKIE_MAX_AGE_SECONDS
	}) as const;

type WorkOsAccessTokenPayload = {
	exp?: number;
	auth_time?: number;
	iss?: string;
	aud?: string | string[];
};

function parseJwtPayload(raw: JsonValue): WorkOsAccessTokenPayload | null {
	if (!isPlainObject(raw)) return null;
	const iss = readString(raw.iss);
	const exp = readFiniteNumber(raw.exp);
	const authTime = readFiniteNumber(raw.auth_time);
	const audString = readString(raw.aud);
	const aud = audString
		? audString
		: Array.isArray(raw.aud)
			? raw.aud.flatMap((entry) => {
					const s = readString(entry);
					return s === undefined ? [] : [s];
				})
			: undefined;
	const payload: WorkOsAccessTokenPayload = {};
	if (iss !== undefined) payload.iss = iss;
	if (exp !== undefined) payload.exp = exp;
	if (authTime !== undefined) payload.auth_time = authTime;
	if (aud !== undefined && (Array.isArray(aud) ? aud.length > 0 : true)) payload.aud = aud;
	return payload;
}

function decodeJwtPayload(token: string): WorkOsAccessTokenPayload | null {
	const parts = token.split('.');
	if (parts.length < 2) return null;
	try {
		const json = Buffer.from(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
			'utf8'
		);
		return parseJwtPayload(parseJsonValue(json));
	} catch {
		return null;
	}
}

export type JwtAuthDiagnostics = {
	iss?: string;
	aud?: string;
	hasAud: boolean;
};

/**
 * Non-secret JWT claims for Sentry / logs when Convex rejects a WorkOS token.
 * Never returns the raw token or subject.
 */
export function getJwtAuthDiagnostics(token: string): JwtAuthDiagnostics {
	const payload = decodeJwtPayload(token);
	const iss = payload?.iss;
	const audRaw = payload?.aud;
	const aud = readString(audRaw) ?? (Array.isArray(audRaw) ? readString(audRaw[0]) : undefined);
	return { iss, aud, hasAud: Boolean(aud) };
}

/** Decode JWT `exp` (seconds since epoch). Returns null if the payload cannot be read. */
export function getJwtExpirySeconds(token: string): number | null {
	const payload = decodeJwtPayload(token);
	return payload?.exp ?? null;
}

/**
 * WorkOS OIDC `auth_time` — last interactive authentication (seconds since epoch).
 * Fails closed when missing or malformed.
 */
export function getJwtAuthTimeSeconds(token: string): number | null {
	const payload = decodeJwtPayload(token);
	return payload?.auth_time ?? null;
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

export function setWorkOsAuthCookies(
	cookies: Cookies,
	tokens: { accessToken: string; refreshToken?: string; userId: string },
	secure: boolean
): void {
	const opts = authCookieOptions(secure);
	cookies.set(WORKOS_ACCESS_COOKIE, tokens.accessToken, opts);
	cookies.set(WORKOS_USER_COOKIE, tokens.userId, opts);
	if (tokens.refreshToken) {
		cookies.set(WORKOS_REFRESH_COOKIE, tokens.refreshToken, opts);
	}
}

export function clearWorkOsAuthCookies(cookies: Cookies): void {
	cookies.delete(WORKOS_ACCESS_COOKIE, { path: '/' });
	cookies.delete(WORKOS_USER_COOKIE, { path: '/' });
	cookies.delete(WORKOS_REFRESH_COOKIE, { path: '/' });
}

export type ResolvedWorkOsSession = {
	accessToken: string;
	userId: string;
};

/**
 * Return a valid access token, refreshing with the httpOnly refresh cookie when needed.
 * Clears auth cookies when refresh is impossible or fails.
 */
export async function resolveWorkOsSession(
	cookies: Cookies,
	secure: boolean
): Promise<ResolvedWorkOsSession | null> {
	const userId = cookies.get(WORKOS_USER_COOKIE);
	const accessToken = cookies.get(WORKOS_ACCESS_COOKIE);

	if (!userId) {
		if (accessToken) clearWorkOsAuthCookies(cookies);
		return null;
	}

	if (accessToken && !isAccessTokenExpired(accessToken)) {
		return { accessToken, userId };
	}

	const refreshToken = cookies.get(WORKOS_REFRESH_COOKIE);
	if (!refreshToken) {
		clearWorkOsAuthCookies(cookies);
		return null;
	}

	const { getWorkOS, getWorkOSClientId } = await import('$lib/workos.server');
	const workos = getWorkOS();
	const clientId = getWorkOSClientId();
	if (!workos || !clientId) {
		clearWorkOsAuthCookies(cookies);
		return null;
	}

	try {
		const response = await workos.userManagement.authenticateWithRefreshToken({
			refreshToken,
			clientId
		});

		setWorkOsAuthCookies(
			cookies,
			{
				accessToken: response.accessToken,
				refreshToken: response.refreshToken ?? refreshToken,
				userId: response.user.id
			},
			secure
		);

		return { accessToken: response.accessToken, userId: response.user.id };
	} catch (error) {
		console.error('WorkOS token refresh failed:', error);
		clearWorkOsAuthCookies(cookies);
		return null;
	}
}

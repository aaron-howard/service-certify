import { env } from '$env/dynamic/public';

/** Canonical public site origin (no trailing slash), when configured. */
export function getPublicAppUrl(): string | null {
	const raw = env.PUBLIC_APP_URL?.trim();
	if (!raw) return null;
	return raw.replace(/\/$/, '');
}

/** Absolute URL for a site path (e.g. `/exams` → `https://example.com/exams`). */
export function absoluteAppUrl(pathname: string): string | null {
	const base = getPublicAppUrl();
	if (!base) return null;
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${base}${path}`;
}

/** Canonical public site origin (no trailing slash) from a raw env string. */
export function getPublicAppUrlFrom(raw: string | undefined): string | null {
	const trimmed = raw?.trim();
	if (!trimmed) return null;
	return trimmed.replace(/\/$/, '');
}

/** Absolute URL for a site path given a base origin (or null). */
export function absoluteAppUrlFrom(base: string | null, pathname: string): string | null {
	if (!base) return null;
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${base}${path}`;
}

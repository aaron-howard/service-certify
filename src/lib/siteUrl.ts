import { env } from '$env/dynamic/public';
import { absoluteAppUrlFrom, getPublicAppUrlFrom } from './siteUrlCore';

export { absoluteAppUrlFrom, getPublicAppUrlFrom } from './siteUrlCore';

/** Canonical public site origin (no trailing slash), when configured. */
export function getPublicAppUrl(): string | null {
	return getPublicAppUrlFrom(env.PUBLIC_APP_URL);
}

/** Absolute URL for a site path using the configured public app URL. */
export function absoluteAppUrl(pathname: string): string | null {
	return absoluteAppUrlFrom(getPublicAppUrl(), pathname);
}

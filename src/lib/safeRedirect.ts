/**
 * Allow only same-origin relative paths for post-auth redirects.
 *
 * `startsWith('/')` is not enough: `//evil.example` is a protocol-relative URL
 * (CodeQL `js/incomplete-url-sanitization`). Resolve against a sentinel origin
 * and require the result to stay on that origin.
 */
const SENTINEL_ORIGIN = 'https://service-certify.invalid';

export function safeInternalRedirect(candidate: string | null | undefined): string | null {
	if (typeof candidate !== 'string' || candidate.length === 0) {
		return null;
	}
	if (candidate.includes('\\') || candidate.includes('\0')) {
		return null;
	}
	// Relative path-absolute only. `//host` is protocol-relative (open redirect).
	if (!candidate.startsWith('/') || candidate.startsWith('//')) {
		return null;
	}

	let resolved: URL;
	try {
		resolved = new URL(candidate, SENTINEL_ORIGIN);
	} catch {
		return null;
	}

	if (resolved.origin !== SENTINEL_ORIGIN) {
		return null;
	}
	if (resolved.username || resolved.password) {
		return null;
	}

	return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

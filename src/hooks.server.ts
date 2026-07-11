import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { captureException, shouldCaptureHttpError } from '$lib/sentry';
import { initRateLimit } from '$lib/rateLimit';
import type { Handle, HandleServerError } from '@sveltejs/kit';

// Rate limiting (requires UPSTASH_REDIS_REST_URL and token).
// Sentry server init lives in instrumentation.server.ts (earliest possible).
initRateLimit();

/**
 * Capture unexpected server errors in Sentry (expected `error()` calls are skipped by SvelteKit).
 * 404s are omitted — missing routes and scanner probes are not actionable.
 */
const serverErrorHandler: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	if (shouldCaptureHttpError(status)) {
		captureException(error, {
			errorId,
			status,
			message,
			path: event.url.pathname
		});
	}

	return {
		message: status === 404 ? message : 'Something went wrong',
		errorId
	};
};

export const handleError = Sentry.handleErrorWithSentry(serverErrorHandler);

/**
 * Middleware to handle WorkOS authentication.
 * Exchanges WorkOS token for Convex JWT if present.
 */
const appHandle: Handle = async ({ event, resolve }) => {
	// Get WorkOS token from cookies
	const workosToken = event.cookies.get('workos_token');
	const workosUserId = event.cookies.get('workos_user_id');

	// If user has WorkOS token, add it to request headers for Convex
	if (workosToken && workosUserId) {
		// Set authorization header for Convex
		event.locals.workosToken = workosToken;
		event.locals.workosUserId = workosUserId;
	}
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=()'
	);

	// HSTS (30 days, include subdomains, preload)
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=2592000; includeSubDomains; preload'
	);

	// CSP is configured in svelte.config.js (kit.csp) so SvelteKit can nonce/hash inline scripts.

	return response;
};

/** Sentry request handler first so traces wrap auth + security middleware. */
export const handle = sequence(Sentry.sentryHandle(), appHandle);

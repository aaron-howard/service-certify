import { initSentry } from '$lib/sentry';
import type { Handle } from '@sveltejs/kit';

// Initialize Sentry for server-side error tracking
initSentry();

export const handle: Handle = async ({ event, resolve }) => {
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

	// Content Security Policy
	// Allows: same-origin scripts/styles, Convex API, Sentry, Vercel Analytics
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'wasm-unsafe-eval' https://cdn.vercel-insights.com https://*.ingest.sentry.io",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self' https://*.convex.cloud https://*.ingest.sentry.io https://cdn.vercel-insights.com",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ')
	);

	return response;
};

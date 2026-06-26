import * as Sentry from '@sentry/svelte';

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Call this once on app startup (client or server).
 */
export function initSentry() {
	// Only initialize if DSN is configured (prevents errors in development without Sentry)
	let dsn = '';
	let environment = 'development';

	// Try to get DSN and environment from various sources
	if (typeof import.meta !== 'undefined' && import.meta.env) {
		dsn = import.meta.env.VITE_SENTRY_DSN || '';
		environment = import.meta.env.MODE || 'development';
	}

	// Fallback for server-side: read from global if available
	if (!dsn) {
		const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
		if (proc?.env) {
			dsn = proc.env.SENTRY_DSN || '';
			environment = proc.env.NODE_ENV || 'development';
		}
	}

	if (!dsn) return;

	Sentry.init({
		dsn,
		environment,
		tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
		release: '0.0.1',
		ignoreErrors: [
			// Browser extension errors
			'top.GLOBALS',
			// Random plugins/extensions
			'Can\'t find variable: ZiteReader',
			'jigsaw is not defined',
			'ComboSearch is not defined',
			// Facebook errors
			'fb_xd_fragment',
			// Chrome extensions
			'chrome-extension://',
			'moz-extension://'
		]
	});
}

/**
 * Set user context for error tracking.
 * Call this after authentication (when user identity is known).
 */
export function setSentryUser(userId: string, email?: string) {
	Sentry.setUser({
		id: userId,
		email
	});
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
	Sentry.setUser(null);
}

/**
 * Capture a message (info, warning, error).
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
	Sentry.captureMessage(message, level);
}

/**
 * Capture an exception.
 */
export function captureException(error: unknown) {
	Sentry.captureException(error);
}

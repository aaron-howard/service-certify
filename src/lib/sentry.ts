import * as Sentry from '@sentry/svelte';
import { version } from '../../package.json';

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Call this once on app startup (client or server).
 * No-ops when DSN is unset (local/CI without Sentry).
 */
export function initSentry() {
	let dsn = '';
	let environment = 'development';

	if (typeof import.meta !== 'undefined' && import.meta.env) {
		dsn = import.meta.env.VITE_SENTRY_DSN || '';
		environment = import.meta.env.MODE || 'development';
	}

	if (!dsn) {
		const proc = typeof globalThis !== 'undefined' ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process : undefined;
		if (proc?.env) {
			dsn = proc.env.SENTRY_DSN || '';
			environment = proc.env.VERCEL_ENV || proc.env.NODE_ENV || 'development';
		}
	}

	if (!dsn) return;

	Sentry.init({
		dsn,
		environment,
		tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
		release: `service-certify@${version}`,
		ignoreErrors: [
			'top.GLOBALS',
			"Can't find variable: ZiteReader",
			'jigsaw is not defined',
			'ComboSearch is not defined',
			'fb_xd_fragment',
			'chrome-extension://',
			'moz-extension://',
			/^Not found:/i
		],
		beforeSend(event) {
			// Drop expected route misses (scanner probes, typos) — keep real failures.
			if (event.extra?.status === 404) return null;
			const values = event.exception?.values ?? [];
			if (values.some((v) => typeof v.value === 'string' && /^Not found:/i.test(v.value))) {
				return null;
			}
			return event;
		}
	});
}

/** Whether handleError should report this status to Sentry. */
export function shouldCaptureHttpError(status: number): boolean {
	return status !== 404;
}

/**
 * Set user context for error tracking.
 * Call after authentication when user identity is known.
 */
export function setSentryUser(userId: string, email?: string) {
	Sentry.setUser({
		id: userId,
		email
	});
}

/** Clear user context on logout / anonymous session. */
export function clearSentryUser() {
	Sentry.setUser(null);
}

/** Capture a message (info, warning, error). */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
	Sentry.captureMessage(message, level);
}

/** Capture an exception (no-op if Sentry was never initialized). */
export function captureException(error: unknown, context?: Record<string, unknown>) {
	if (context) {
		Sentry.withScope((scope) => {
			scope.setExtras(context);
			Sentry.captureException(error);
		});
		return;
	}
	Sentry.captureException(error);
}

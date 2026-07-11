import * as Sentry from '@sentry/sveltekit';
import { version } from '../../package.json';

type ProcessEnv = Record<string, string | undefined>;

function processEnv(): ProcessEnv | undefined {
	const proc =
		typeof globalThis !== 'undefined'
			? (globalThis as { process?: { env?: ProcessEnv } }).process
			: undefined;
	return proc?.env;
}

/**
 * Resolve DSN from app env vars and the Vercel → Sentry integration.
 *
 * Vercel Marketplace / Sentry integration injects `NEXT_PUBLIC_SENTRY_DSN`
 * (Next.js-oriented). We also accept SvelteKit/Vite names used in this repo.
 */
export function resolveSentryDsn(): string {
	if (typeof import.meta !== 'undefined' && import.meta.env) {
		const fromVite =
			import.meta.env.VITE_SENTRY_DSN ||
			import.meta.env.PUBLIC_SENTRY_DSN ||
			import.meta.env.NEXT_PUBLIC_SENTRY_DSN ||
			'';
		if (fromVite) return String(fromVite);
	}

	const env = processEnv();
	if (!env) return '';

	return (
		env.SENTRY_DSN ||
		env.NEXT_PUBLIC_SENTRY_DSN ||
		env.VITE_SENTRY_DSN ||
		env.PUBLIC_SENTRY_DSN ||
		''
	);
}

export function resolveSentryEnvironment(): string {
	const env = processEnv();
	if (env?.VERCEL_ENV) return env.VERCEL_ENV;
	if (env?.NODE_ENV) return env.NODE_ENV;
	if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
		return String(import.meta.env.MODE);
	}
	return 'development';
}

const ignoreErrors = [
	'top.GLOBALS',
	"Can't find variable: ZiteReader",
	'jigsaw is not defined',
	'ComboSearch is not defined',
	'fb_xd_fragment',
	'chrome-extension://',
	'moz-extension://'
];

export type SentryInitExtras = {
	/** Client-only options (e.g. Session Replay). Do not pass from server. */
	integrations?: unknown[];
	replaysSessionSampleRate?: number;
	replaysOnErrorSampleRate?: number;
};

/**
 * Shared Sentry.init options for client and server.
 * Returns null when no DSN is configured (local/CI without Sentry).
 */
export function getSentryInitOptions(extras: SentryInitExtras = {}) {
	const dsn = resolveSentryDsn();
	if (!dsn) return null;

	const environment = resolveSentryEnvironment();
	return {
		dsn,
		environment,
		tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
		release: `service-certify@${version}`,
		ignoreErrors,
		...extras
	};
}

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Call once on app startup (client or server). No-ops when DSN is unset.
 *
 * Pass client-only extras (replay) from `hooks.client.ts` — the Node/server
 * build of `@sentry/sveltekit` does not export `replayIntegration`.
 */
export function initSentry(extras: SentryInitExtras = {}) {
	const initOptions = getSentryInitOptions(extras);
	if (!initOptions) return;
	Sentry.init(initOptions as Parameters<typeof Sentry.init>[0]);
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

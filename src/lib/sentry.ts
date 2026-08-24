import * as Sentry from '@sentry/sveltekit';
import { resolveSentryReleaseName } from './appVersion';
import {
	isPlainObject,
	isStringValue,
	readProcessEnv,
	readString,
	type JsonObject,
	type JsonValue
} from './parse';

/**
 * Sentry release: `service-certify@<semver>+<12-char-sha>` on Vercel,
 * or `service-certify@<semver>` locally / without a commit SHA.
 */
export function resolveSentryRelease(): string {
	return resolveSentryReleaseName();
}

const BOT_NOISE_ERROR_PATTERNS = [/No form actions exist for this page/i, /Method Not Allowed/i];

function messageFromObject(value: JsonObject): string {
	const message = value.message;
	if (isStringValue(message)) return `${message}`;
	if (message != null) return String(message);
	return '';
}

/** Drop known scanner/bot noise that still slips past status filtering. */
export function isBotNoiseError(error: Error | string | JsonObject | null | undefined): boolean {
	const message =
		error instanceof Error
			? error.message
			: isStringValue(error)
				? `${error}`
				: error && isPlainObject(error)
					? messageFromObject(error)
					: '';
	return BOT_NOISE_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Resolve DSN from app env vars and the Vercel → Sentry integration.
 *
 * Vercel Marketplace / Sentry integration injects `NEXT_PUBLIC_SENTRY_DSN`
 * (Next.js-oriented). We also accept SvelteKit/Vite names used in this repo.
 */
export function resolveSentryDsn(): string {
	const fromVite =
		import.meta.env.VITE_SENTRY_DSN ||
		import.meta.env.PUBLIC_SENTRY_DSN ||
		import.meta.env.NEXT_PUBLIC_SENTRY_DSN ||
		'';
	if (fromVite) return String(fromVite);

	const env = readProcessEnv();
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
	const env = readProcessEnv();
	if (env?.VERCEL_ENV) return env.VERCEL_ENV;
	if (env?.NODE_ENV) return env.NODE_ENV;
	const mode = readString(import.meta.env?.MODE);
	if (mode) return mode;
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
	integrations?: object[];
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
		release: resolveSentryRelease(),
		ignoreErrors,
		beforeSend(event: { message?: string }, hint: { originalException?: JsonValue | Error }) {
			const original = hint.originalException;
			if (original instanceof Error) {
				if (isBotNoiseError(original)) return null;
			} else if (isStringValue(original)) {
				if (isBotNoiseError(`${original}`)) return null;
			} else if (isPlainObject(original)) {
				if (isBotNoiseError(original)) return null;
			} else if (event.message && isBotNoiseError(event.message)) {
				return null;
			}
			return event;
		},
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
	// SAFETY: getSentryInitOptions builds the subset Sentry.init accepts; extras are client-only options.
	Sentry.init(initOptions as Parameters<typeof Sentry.init>[0]);
}

/**
 * Whether handleError should report this status to Sentry.
 * Skip 404 (missing routes) and 405 (scanner POSTs to pages without form actions).
 */
export function shouldCaptureHttpError(status: number): boolean {
	return status !== 404 && status !== 405;
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

export type SentryExceptionContext = Record<string, string | number | boolean | null>;

function toCaptureableError(cause: unknown): Error | string {
	if (cause instanceof Error) return cause;
	const tag = Object.prototype.toString.call(cause);
	if (tag === '[object String]') return String(cause);
	if (tag === '[object Object]' && cause !== null) {
		// SAFETY: plain object branch after tag check; message is optional telemetry.
		const message = (cause as JsonObject).message;
		if (isStringValue(message)) return new Error(`${message}`);
		if (message != null) return new Error(String(message));
		return new Error('Unknown error');
	}
	return new Error(String(cause));
}

/** Capture an exception (no-op if Sentry was never initialized). */
export function captureException(cause: unknown, context?: SentryExceptionContext) {
	const captureable = toCaptureableError(cause);
	if (context) {
		Sentry.withScope((scope) => {
			scope.setExtras(context);
			Sentry.captureException(captureable);
		});
		return;
	}
	Sentry.captureException(captureable);
}

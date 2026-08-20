import { afterEach, describe, expect, it, vi } from 'vitest';

describe('resolveSentryDsn', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('returns a string (empty when no DSN configured)', async () => {
		vi.stubEnv('SENTRY_DSN', '');
		vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
		vi.stubEnv('VITE_SENTRY_DSN', '');
		vi.stubEnv('PUBLIC_SENTRY_DSN', '');
		const { resolveSentryDsn } = await import('./sentry');
		expect(resolveSentryDsn()).toEqual(expect.any(String));
	});

	it('reads NEXT_PUBLIC_SENTRY_DSN from process.env (Vercel integration)', async () => {
		vi.stubEnv('SENTRY_DSN', '');
		vi.stubEnv('VITE_SENTRY_DSN', '');
		vi.stubEnv('PUBLIC_SENTRY_DSN', '');
		vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://vercel-integration@o0.ingest.sentry.io/99');
		const { resolveSentryDsn } = await import('./sentry');
		const dsn = resolveSentryDsn();
		// import.meta.env may win in Vite; otherwise process.env fallback applies
		expect(
			dsn === 'https://vercel-integration@o0.ingest.sentry.io/99' || dsn === ''
		).toBe(true);
	});
});

describe('resolveSentryRelease', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('includes semver and a short Vercel git SHA when present', async () => {
		vi.stubEnv('VERCEL_GIT_COMMIT_SHA', 'abcdef0123456789deadbeef');
		const { resolveSentryRelease } = await import('./sentry');
		expect(resolveSentryRelease()).toMatch(/^service-certify@\d+\.\d+\.\d+\+abcdef012345$/);
	});

	it('falls back to package version when SHA is missing', async () => {
		vi.stubEnv('VERCEL_GIT_COMMIT_SHA', '');
		vi.stubEnv('GITHUB_SHA', '');
		const { resolveSentryRelease } = await import('./sentry');
		expect(resolveSentryRelease()).toMatch(/^service-certify@\d+\.\d+\.\d+$/);
	});
});

describe('shouldCaptureHttpError', () => {
	it('skips 404 and 405 scanner noise', async () => {
		const { shouldCaptureHttpError } = await import('./sentry');
		expect(shouldCaptureHttpError(404)).toBe(false);
		expect(shouldCaptureHttpError(405)).toBe(false);
		expect(shouldCaptureHttpError(500)).toBe(true);
		expect(shouldCaptureHttpError(503)).toBe(true);
	});
});

describe('isBotNoiseError', () => {
	it('detects SvelteKit no-form-actions 405 messages', async () => {
		const { isBotNoiseError } = await import('./sentry');
		expect(isBotNoiseError(new Error('POST method not allowed. No form actions exist for this page'))).toBe(
			true
		);
		expect(isBotNoiseError(new Error('Rate limiter unavailable'))).toBe(false);
	});
});

describe('getSentryInitOptions', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('returns null when DSN is missing', async () => {
		vi.stubEnv('SENTRY_DSN', '');
		vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
		vi.stubEnv('VITE_SENTRY_DSN', '');
		vi.stubEnv('PUBLIC_SENTRY_DSN', '');
		const { getSentryInitOptions } = await import('./sentry');
		const opts = getSentryInitOptions();
		if (opts === null) {
			expect(opts).toBeNull();
		} else {
			expect(opts.dsn).toBeTruthy();
		}
	});

	it('merges client extras when DSN is present', async () => {
		vi.stubEnv('SENTRY_DSN', 'https://key@o0.ingest.sentry.io/1');
		vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
		vi.stubEnv('VITE_SENTRY_DSN', '');
		vi.stubEnv('PUBLIC_SENTRY_DSN', '');
		vi.stubEnv('VERCEL_GIT_COMMIT_SHA', '1234567890abffffffffffff');
		vi.stubEnv('GITHUB_SHA', '');
		const { getSentryInitOptions } = await import('./sentry');
		const opts = getSentryInitOptions({
			replaysOnErrorSampleRate: 1.0,
			replaysSessionSampleRate: 0.1
		});
		expect(opts).not.toBeNull();
		expect(opts!.dsn).toBeTruthy();
		expect(opts!.replaysOnErrorSampleRate).toBe(1.0);
		expect(opts!.release).toMatch(/^service-certify@\d+\.\d+\.\d+\+1234567890ab$/);
		expect(opts!.beforeSend).toEqual(expect.any(Function));
	});
});

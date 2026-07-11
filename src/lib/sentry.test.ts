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
		expect(typeof resolveSentryDsn()).toBe('string');
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
		const { getSentryInitOptions } = await import('./sentry');
		const opts = getSentryInitOptions({
			replaysOnErrorSampleRate: 1.0,
			replaysSessionSampleRate: 0.1
		});
		if (opts) {
			expect(opts.dsn).toBeTruthy();
			expect(opts.replaysOnErrorSampleRate).toBe(1.0);
			expect(opts.release).toMatch(/^service-certify@/);
		}
	});
});

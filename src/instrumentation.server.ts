import { initSentry } from '$lib/sentry';

/**
 * Earliest server-side init (SvelteKit experimental instrumentation).
 * Required for @sentry/sveltekit auto-instrumentation on Vercel Node runtimes.
 */
initSentry();

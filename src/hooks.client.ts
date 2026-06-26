import { initSentry } from '$lib/sentry';
import * as Sentry from '@sentry/svelte';

// Initialize Sentry error tracking
initSentry();

// Set up error boundary for the entire app
Sentry.init({
	// Re-initialize if needed, but typically only on first call above
});

// Capture unhandled errors via SvelteKit's error handler
if (typeof window !== 'undefined') {
	window.addEventListener('error', (event) => {
		Sentry.captureException(event.error);
	});

	window.addEventListener('unhandledrejection', (event) => {
		Sentry.captureException(event.reason);
	});
}

import { initSentry, captureException, shouldCaptureHttpError } from '$lib/sentry';
import type { HandleClientError } from '@sveltejs/kit';

/** Runs once when the client app starts (SvelteKit calls this explicitly). */
export function init() {
	initSentry();
}

/**
 * Capture unexpected client-side errors in Sentry.
 * 404s are omitted — missing routes and scanner probes are not actionable.
 */
export const handleError: HandleClientError = async ({ error, event, status, message }) => {
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

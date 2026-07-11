import * as Sentry from '@sentry/sveltekit';
import { initSentry, captureException } from '$lib/sentry';
import type { HandleClientError } from '@sveltejs/kit';

/** Runs once when the client app starts (SvelteKit calls this explicitly). */
export function init() {
	initSentry({
		integrations: [Sentry.replayIntegration()],
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0
	});
}

/**
 * Capture unexpected client-side errors in Sentry.
 */
const clientErrorHandler: HandleClientError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	captureException(error, {
		errorId,
		status,
		message,
		path: event.url.pathname
	});

	return {
		message: status === 404 ? message : 'Something went wrong',
		errorId
	};
};

export const handleError = Sentry.handleErrorWithSentry(clientErrorHandler);

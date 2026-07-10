import { initSentry, captureException } from '$lib/sentry';
import type { HandleClientError } from '@sveltejs/kit';

/** Runs once when the client app starts (SvelteKit calls this explicitly). */
export function init() {
	initSentry();
}

/**
 * Capture unexpected client-side errors in Sentry.
 */
export const handleError: HandleClientError = async ({ error, event, status, message }) => {
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

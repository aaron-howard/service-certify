import { initSentry } from '$lib/sentry';

/** Runs once when the client app starts (SvelteKit calls this explicitly). */
export function init() {
	initSentry();
}

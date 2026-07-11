import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { defineConfig } from 'vite';

/**
 * Expose Vercel→Sentry integration DSN (`NEXT_PUBLIC_SENTRY_DSN`) to the client
 * alongside Vite (`VITE_`) and SvelteKit (`PUBLIC_`) prefixes.
 */
export default defineConfig({
	envPrefix: ['VITE_', 'PUBLIC_', 'NEXT_PUBLIC_'],
	plugins: [
		// Must run before sveltekit(). Reads SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT
		// injected by the Vercel → Sentry integration for source map + release upload.
		sentrySvelteKit({
			adapter: 'vercel',
			autoUploadSourceMaps: Boolean(process.env.SENTRY_AUTH_TOKEN)
		}),
		tailwindcss(),
		sveltekit()
	]
});

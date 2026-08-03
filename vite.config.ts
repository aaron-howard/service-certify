import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { defineConfig } from 'vite';

/**
 * Short git SHA baked into client + server bundles at build time so browser
 * Sentry events share the same release id as Node (Vercel does not expose
 * VERCEL_GIT_COMMIT_SHA to import.meta.env by default).
 */
function resolveBuildRevision(): string {
	const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
	return sha ? sha.slice(0, 12) : '';
}

/**
 * Expose Vercel→Sentry integration DSN (`NEXT_PUBLIC_SENTRY_DSN`) to the client
 * alongside Vite (`VITE_`) and SvelteKit (`PUBLIC_`) prefixes.
 */
export default defineConfig({
	envPrefix: ['VITE_', 'PUBLIC_', 'NEXT_PUBLIC_'],
	define: {
		'import.meta.env.VITE_GIT_COMMIT_SHA': JSON.stringify(resolveBuildRevision())
	},
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

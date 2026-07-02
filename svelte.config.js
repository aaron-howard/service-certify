import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$convex: 'src/convex'
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': [
					'self',
					'wasm-unsafe-eval',
					'https://cdn.vercel-insights.com',
					'https://va.vercel-scripts.com'
				],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'connect-src': [
					'self',
					'https://*.convex.cloud',
					'wss://*.convex.cloud',
					'https://*.ingest.sentry.io',
					'https://*.ingest.us.sentry.io',
					'https://cdn.vercel-insights.com',
					'https://va.vercel-scripts.com',
					'https://vitals.vercel-insights.com'
				],
				'frame-ancestors': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) => filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		// Use happy-dom for DOM testing (lightweight alternative to jsdom)
		environment: 'happy-dom',
		// Include test files
		include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/**/*.d.ts',
				'**/*.svelte'
			]
		},
		// Global test setup
		globals: true
	}
});

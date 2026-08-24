import { configDefaults, defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const privateBankPath = path.join(root, 'src/convex/seed/devQuestionBank.private.ts');
const hasFullQuestionBank =
	fs.existsSync(privateBankPath) && fs.statSync(privateBankPath).size > 100_000;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		// Use happy-dom for DOM testing (lightweight alternative to jsdom)
		environment: 'happy-dom',
		// Include test files
		include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
		exclude: [
			...configDefaults.exclude,
			...(hasFullQuestionBank
				? []
				: [
						'src/convex/seed/*realism.test.ts',
						'src/convex/seed/trackQuality.test.ts',
						'src/convex/seed/cis-disco.test.ts'
					])
		],
		alias: {
			'$env/dynamic/public': path.join(root, 'src/lib/test-stubs/env-public.ts'),
			'$env/dynamic/private': path.join(root, 'src/lib/test-stubs/env-private.ts')
		},
		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/**/*.d.ts', '**/*.svelte']
		},
		// Global test setup
		globals: true
	}
});

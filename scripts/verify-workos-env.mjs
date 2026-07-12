#!/usr/bin/env node
/**
 * Verify WorkOS API key tier matches the intended deploy environment.
 *
 * Usage:
 *   npm run verify:workos-env
 *   VERCEL_ENV=production WORKOS_API_KEY=sk_live_... npm run verify:workos-env
 *
 * Exits 0 when aligned or checks are skipped (missing key); exits 1 on misconfiguration.
 */

const vercelEnv = process.env.VERCEL_ENV ?? '';
const nodeEnv = process.env.NODE_ENV ?? 'development';
const apiKey = process.env.WORKOS_API_KEY ?? '';

function resolveDeployEnvironment() {
	if (vercelEnv === 'production') return 'production';
	if (vercelEnv === 'preview') return 'preview';
	if (nodeEnv === 'production' && !vercelEnv) return 'production';
	return 'development';
}

function inferWorkOsKeyEnvironment(key) {
	if (!key) return 'unknown';
	if (key.startsWith('sk_live_')) return 'production';
	if (key.startsWith('sk_test_')) return 'staging';
	return 'unknown';
}

const deploy = resolveDeployEnvironment();
const workosEnv = inferWorkOsKeyEnvironment(apiKey);

if (!apiKey) {
	console.log('verify:workos-env — WORKOS_API_KEY not set; skipping.');
	process.exit(0);
}

console.log(`Deploy tier: ${deploy}`);
console.log(`WorkOS key tier: ${workosEnv}`);

if (deploy === 'production' && workosEnv === 'staging') {
	console.error(
		'\nERROR: Production deploy (VERCEL_ENV=production) must use a production WorkOS key (sk_live_...).\n' +
			'See docs/WORKOS-ENVIRONMENTS.md'
	);
	process.exit(1);
}

if (deploy !== 'production' && workosEnv === 'production') {
	console.warn(
		'\nWARN: Non-production deploy is using a production WorkOS key (sk_live_...).\n' +
			'Prefer sk_test_ for local and preview. See docs/WORKOS-ENVIRONMENTS.md'
	);
}

console.log('WorkOS key alignment OK.');
process.exit(0);

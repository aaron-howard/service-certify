#!/usr/bin/env node
/**
 * Verify Convex deployment has auth env vars required for admin bootstrap + JWT validation.
 *
 * Usage:
 *   npm run verify:convex-auth-env
 *   npm run verify:convex-auth-env -- --prod
 *
 * Exits 0 when configured; exits 1 when required vars are missing.
 */

import { spawnSync } from 'node:child_process';

const prod = process.argv.includes('--prod');
const args = ['env', 'list', ...(prod ? ['--prod'] : [])];
const label = prod ? 'prod' : 'dev';

	const result = spawnSync('npx', ['convex', ...args], {
		encoding: 'utf8',
		shell: process.platform === 'win32',
		windowsHide: true
	});

if (result.status !== 0) {
	console.error(result.stderr || result.stdout);
	process.exit(result.status ?? 1);
}

const output = result.stdout.trim();
const vars = new Map();
for (const line of output.split('\n')) {
	const idx = line.indexOf('=');
	if (idx === -1) continue;
	vars.set(line.slice(0, idx), line.slice(idx + 1));
}

const missing = [];
if (!vars.get('WORKOS_CLIENT_ID')) missing.push('WORKOS_CLIENT_ID');
if (!vars.get('ADMIN_EMAILS')) missing.push('ADMIN_EMAILS');

console.log(`Convex ${label} env:`);
if (output) {
	console.log(output);
} else {
	console.log('(no variables set)');
}

if (missing.length) {
	console.error(
		`\nERROR: Missing on ${label} deployment: ${missing.join(', ')}.\n` +
			`Set with:\n` +
			`  npx convex env set WORKOS_CLIENT_ID client_...${prod ? ' --prod' : ''}\n` +
			`  npx convex env set ADMIN_EMAILS you@example.com${prod ? ' --prod' : ''}\n` +
			'See docs/WORKOS-ENVIRONMENTS.md'
	);
	process.exit(1);
}

console.log(`Convex ${label} auth env OK.`);

#!/usr/bin/env node
/**
 * Verify Upstash Redis rate limiting works end-to-end.
 *
 * Phase A: live sliding-window ZSET against Upstash (always; fail hard if missing).
 * Phase B: HTTP proof that POST /api/practice/grade returns 429 after 10 reqs
 *          (skipped when the app is not reachable).
 *
 * Usage:
 *   npm run verify:upstash
 *   VERIFY_BASE_URL=http://localhost:5173 npm run verify:upstash
 *
 * Loads UPSTASH_* from the environment and from .env.local if present.
 * Exits 0 on success; exits 1 on failure or missing credentials.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_LOCAL = resolve(ROOT, '.env.local');

function loadEnvLocal() {
	if (!existsSync(ENV_LOCAL)) return;
	const text = readFileSync(ENV_LOCAL, 'utf8');
	for (const line of text.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (!(key in process.env) || process.env[key] === '') {
			process.env[key] = value;
		}
	}
}

/**
 * Mirror of checkRateLimit in src/lib/rateLimit.ts (sliding window ZSET).
 */
async function checkRateLimit(redis, identifier, options = {}) {
	const windowSeconds = options.windowSeconds ?? 60;
	const maxRequests = options.maxRequests ?? 100;
	const keyPrefix = options.keyPrefix ?? 'rate-limit:';
	const key = `${keyPrefix}${identifier}`;

	const now = Date.now();
	const windowStart = now - windowSeconds * 1000;

	await redis.zremrangebyscore(key, 0, windowStart);
	const current = await redis.zcard(key);
	const allowed = current < maxRequests;

	if (allowed) {
		await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
		await redis.expire(key, Math.ceil(windowSeconds) + 1);
	}

	const oldest = await redis.zrange(key, 0, 0, { withScores: true });
	const resetIn =
		oldest.length > 0
			? Math.ceil(
					(((oldest[0].score ?? oldest[0][1]) + windowSeconds * 1000 - now) / 1000)
				)
			: windowSeconds;

	return {
		allowed,
		current: Math.min(current, maxRequests),
		limit: maxRequests,
		resetIn: Math.max(0, resetIn),
		key
	};
}

async function getRateLimitStatus(redis, identifier, options = {}) {
	const windowSeconds = options.windowSeconds ?? 60;
	const maxRequests = options.maxRequests ?? 100;
	const keyPrefix = options.keyPrefix ?? 'rate-limit:';
	const key = `${keyPrefix}${identifier}`;

	const now = Date.now();
	const windowStart = now - windowSeconds * 1000;
	const current = await redis.zcount(key, windowStart, now);

	return {
		allowed: current < maxRequests,
		current,
		limit: maxRequests,
		key
	};
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

async function phaseA(redis, runId) {
	console.log('\nPhase A — direct Upstash sliding-window ZSET');

	const maxRequests = 3;
	const windowSeconds = 60;
	const keyPrefix = `verify-upstash:${runId}:`;
	const identifier = 'probe';

	let key;
	try {
		for (let i = 1; i <= maxRequests; i++) {
			const result = await checkRateLimit(redis, identifier, {
				windowSeconds,
				maxRequests,
				keyPrefix
			});
			key = result.key;
			assert(result.allowed === true, `request ${i}: expected allowed=true, got false`);
			assert(
				result.current === i - 1,
				`request ${i}: expected current=${i - 1} before add semantics match, got ${result.current}`
			);
			console.log(`  request ${i}: allowed (count before add=${result.current})`);
		}

		const blocked = await checkRateLimit(redis, identifier, {
			windowSeconds,
			maxRequests,
			keyPrefix
		});
		assert(blocked.allowed === false, 'request 4: expected allowed=false');
		assert(blocked.current === maxRequests, `request 4: expected current=${maxRequests}`);
		console.log(`  request 4: denied (current=${blocked.current}/${blocked.limit})`);

		const status1 = await getRateLimitStatus(redis, identifier, {
			windowSeconds,
			maxRequests,
			keyPrefix
		});
		const status2 = await getRateLimitStatus(redis, identifier, {
			windowSeconds,
			maxRequests,
			keyPrefix
		});
		assert(status1.current === maxRequests, `status: expected current=${maxRequests}`);
		assert(
			status1.current === status2.current,
			'status reads must not consume requests'
		);
		console.log(`  status (non-consuming): ${status1.current}/${status1.limit}`);

		console.log('Phase A OK');
	} finally {
		if (key) {
			await redis.del(key);
			console.log(`  cleaned up key ${key}`);
		}
	}
}

async function phaseB(runId, baseUrl) {
	console.log(`\nPhase B — HTTP grade 429 via ${baseUrl}`);

	let healthy = false;
	try {
		const health = await fetch(`${baseUrl}/api/health`, {
			signal: AbortSignal.timeout(3000)
		});
		healthy = health.ok || health.status === 503;
	} catch {
		healthy = false;
	}

	if (!healthy) {
		console.log('  SKIP: app not reachable (start npm run dev, then re-run)');
		return 'skipped';
	}

	const forwardedFor = `verify-upstash-${runId}`;
	const limit = 10;
	const statuses = [];

	for (let i = 1; i <= limit; i++) {
		const res = await fetch(`${baseUrl}/api/practice/grade`, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				'X-Forwarded-For': forwardedFor
			},
			body: 'not-json',
			signal: AbortSignal.timeout(10000)
		});
		statuses.push(res.status);
		assert(
			res.status !== 429,
			`request ${i}/${limit}: unexpected 429 (statuses so far: ${statuses.join(',')})`
		);
		console.log(`  request ${i}: HTTP ${res.status} (not 429)`);
	}

	const blocked = await fetch(`${baseUrl}/api/practice/grade`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
			'X-Forwarded-For': forwardedFor
		},
		body: 'not-json',
		signal: AbortSignal.timeout(10000)
	});

	assert(blocked.status === 429, `request 11: expected 429, got ${blocked.status}`);
	const retryAfter = blocked.headers.get('Retry-After');
	assert(retryAfter !== null, 'request 11: missing Retry-After header');
	console.log(`  request 11: HTTP 429 (Retry-After=${retryAfter})`);
	console.log('Phase B OK');
	return 'ok';
}

async function main() {
	loadEnvLocal();

	const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
	const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
	const baseUrl = (process.env.VERIFY_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
	const runId = randomUUID().slice(0, 8);

	console.log('verify:upstash — Upstash rate-limit E2E');
	console.log(`  runId: ${runId}`);

	if (!url || !token) {
		console.error(
			'\nERROR: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required.\n' +
				'Add them to .env.local (see docs/RATE-LIMITING.md).'
		);
		process.exit(1);
	}

	if (!url.startsWith('https://')) {
		console.error('\nERROR: UPSTASH_REDIS_REST_URL must start with https://');
		process.exit(1);
	}

	const redis = new Redis({ url, token });

	await phaseA(redis, runId);
	await phaseB(runId, baseUrl);

	console.log('\nUpstash rate limiting verified.');
	process.exit(0);
}

main().catch((err) => {
	console.error('\nverify:upstash FAILED:', err instanceof Error ? err.message : err);
	process.exit(1);
});

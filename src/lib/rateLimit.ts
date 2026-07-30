import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

/**
 * Rate limiter using Upstash Redis with sliding window algorithm.
 *
 * Initialize once at app startup, then use in route handlers or mutations.
 *
 * Behavior without Redis credentials:
 * - Non-production: fail open (allow traffic) so local/CI works without Upstash
 * - Production (`VERCEL_ENV=production`): fail closed (deny) — Upstash is required
 */

let redis: Redis | null = null;
let warnedMissingCredentials = false;
let warnedRedisFailure = false;

export function isProductionEnvironment(): boolean {
	return env.VERCEL_ENV === 'production';
}

/**
 * Why a request was allowed or denied.
 *
 * `limiter_unavailable` means we never learned the real request count — Upstash is
 * unconfigured, misconfigured, or unreachable. Callers must not report that as a
 * 429, or users see "slow down" when the actual problem is server-side.
 */
export type RateLimitOutcome = 'allowed' | 'limit_exceeded' | 'limiter_unavailable';

interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean;
	/** Current request count in window */
	current: number;
	/** Max allowed requests */
	limit: number;
	/** Seconds until window resets */
	resetIn: number;
	/** Why the request was allowed or denied */
	outcome: RateLimitOutcome;
}

function allowWhenUnavailable(maxRequests: number, windowSeconds: number): RateLimitResult {
	return {
		allowed: true,
		current: 0,
		limit: maxRequests,
		resetIn: windowSeconds,
		outcome: 'limiter_unavailable'
	};
}

function denyWhenUnavailable(maxRequests: number, windowSeconds: number): RateLimitResult {
	return {
		allowed: false,
		current: maxRequests,
		limit: maxRequests,
		resetIn: windowSeconds,
		outcome: 'limiter_unavailable'
	};
}

/** Fail open in non-prod; fail closed in production when Redis is missing or errors. */
export function unavailableRateLimitResult(
	maxRequests: number,
	windowSeconds: number,
	production = isProductionEnvironment()
): RateLimitResult {
	return production
		? denyWhenUnavailable(maxRequests, windowSeconds)
		: allowWhenUnavailable(maxRequests, windowSeconds);
}

function fallbackWhenUnavailable(maxRequests: number, windowSeconds: number) {
	return unavailableRateLimitResult(maxRequests, windowSeconds);
}

/**
 * Env values pasted from a dotenv file often keep their surrounding quotes, and
 * Upstash rejects `Bearer "token"` with an opaque `WRONGPASS` error. Strip the
 * wrapper so a copy/paste artifact can't disable rate limiting.
 */
export function sanitizeCredential(value: string | undefined | null): string {
	const trimmed = (value ?? '').trim();
	const quoted =
		trimmed.length >= 2 &&
		((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
			(trimmed.startsWith("'") && trimmed.endsWith("'")));
	return quoted ? trimmed.slice(1, -1).trim() : trimmed;
}

/** Log Upstash failures once per instance, calling out credential problems explicitly. */
function logRedisFailure(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	const isAuthFailure = /WRONGPASS|NOPERM|unauthorized/i.test(message);

	if (isAuthFailure && !warnedRedisFailure) {
		warnedRedisFailure = true;
		console.error(
			`Rate limiting unavailable: Upstash rejected the credentials (${message}). ` +
				'Verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN match the same database ' +
				'and were stored without surrounding quotes or whitespace.'
		);
		return;
	}

	console.error('Rate limit check error:', error);
}

/**
 * Initialize the rate limiter with Upstash Redis credentials.
 * Call this once on server startup.
 */
export function initRateLimit() {
	const url = sanitizeCredential(env.UPSTASH_REDIS_REST_URL);
	const token = sanitizeCredential(env.UPSTASH_REDIS_REST_TOKEN);

	if (!url || !token) {
		if (!warnedMissingCredentials) {
			warnedMissingCredentials = true;
			if (isProductionEnvironment()) {
				console.error(
					'Rate limiting unavailable in production: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. Requests will be denied.'
				);
			} else {
				console.warn(
					'Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured (fail-open outside production)'
				);
			}
		}
		return;
	}

	if (!/^https?:\/\//.test(url)) {
		console.error(
			`Rate limiting unavailable: UPSTASH_REDIS_REST_URL must start with https:// (got "${url.slice(0, 12)}…").`
		);
		return;
	}

	try {
		redis = new Redis({ url, token });
	} catch (error) {
		console.error('Failed to initialize rate limiter:', error);
		redis = null;
	}
}

interface RateLimitOptions {
	/** Window in seconds (default: 60) */
	windowSeconds?: number;
	/** Max requests per window (default: 100) */
	maxRequests?: number;
	/** Optional custom key prefix (default: 'rate-limit:') */
	keyPrefix?: string;
}

/**
 * Check if a request is within rate limits.
 * Uses sliding window algorithm (ZSET).
 *
 * @param identifier - Unique identifier (IP, user ID, API key)
 * @param options - Rate limit configuration
 * @returns Whether request is allowed + current count
 */
export async function checkRateLimit(
	identifier: string,
	options: RateLimitOptions = {}
): Promise<RateLimitResult> {
	const windowSeconds = options.windowSeconds ?? 60;
	const maxRequests = options.maxRequests ?? 100;
	const keyPrefix = options.keyPrefix ?? 'rate-limit:';
	const key = `${keyPrefix}${identifier}`;

	if (!redis) {
		return fallbackWhenUnavailable(maxRequests, windowSeconds);
	}

	try {
		const now = Date.now();
		const windowStart = now - windowSeconds * 1000;

		// Remove old entries outside the window
		await redis.zremrangebyscore(key, 0, windowStart);

		// Count requests in current window
		const current = await redis.zcard(key);

		// Check if over limit
		const allowed = current < maxRequests;

		if (allowed) {
			// Add current request with timestamp as score
			await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
			// Set expiration (delete key after window passes)
			await redis.expire(key, Math.ceil(windowSeconds) + 1);
		}

		// Calculate when window resets (oldest entry + windowSeconds)
		const oldest = await redis.zrange(key, 0, 0, { withScores: true });
		const resetIn =
			oldest.length > 0
				? Math.ceil(
						(((oldest[0] as { score?: number }).score as number) +
							windowSeconds * 1000 -
							now) /
							1000
					)
				: windowSeconds;

		return {
			allowed,
			current: Math.min(current, maxRequests),
			limit: maxRequests,
			resetIn: Math.max(0, resetIn),
			outcome: allowed ? 'allowed' : 'limit_exceeded'
		};
	} catch (error) {
		logRedisFailure(error);
		return fallbackWhenUnavailable(maxRequests, windowSeconds);
	}
}

/**
 * Thrown by `rateLimit()` when a request must not proceed.
 *
 * Check `outcome` before choosing a status: a `limiter_unavailable` denial is a
 * server-side dependency failure (503), not a client sending too many requests (429).
 */
export class RateLimitError extends Error {
	readonly outcome: RateLimitOutcome;
	readonly status: number;
	readonly headers: Record<string, string>;
	readonly result: RateLimitResult;

	constructor(result: RateLimitResult) {
		const limiterUnavailable = result.outcome === 'limiter_unavailable';
		super(limiterUnavailable ? 'Rate limiter unavailable' : 'Too Many Requests');
		this.name = 'RateLimitError';
		this.outcome = result.outcome;
		this.status = limiterUnavailable ? 503 : 429;
		this.result = result;
		this.headers = {
			'Retry-After': String(result.resetIn),
			'X-RateLimit-Limit': String(result.limit),
			'X-RateLimit-Remaining': String(Math.max(0, result.limit - result.current)),
			'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + result.resetIn)
		};
	}
}

/**
 * Rate limit middleware for SvelteKit routes.
 * Use in hooks.server.ts or route handlers.
 *
 * @param identifier - Unique identifier (e.g., client IP)
 * @param options - Rate limit configuration
 * @returns the rate limit result, or throws `RateLimitError` when the request must be denied
 */
export async function rateLimit(identifier: string, options: RateLimitOptions = {}) {
	const result = await checkRateLimit(identifier, options);

	if (!result.allowed) {
		throw new RateLimitError(result);
	}

	return result;
}

/**
 * Get current rate limit status (for debugging).
 * Does NOT consume a request.
 */
export async function getRateLimitStatus(
	identifier: string,
	options: RateLimitOptions = {}
): Promise<RateLimitResult> {
	const windowSeconds = options.windowSeconds ?? 60;
	const maxRequests = options.maxRequests ?? 100;
	const keyPrefix = options.keyPrefix ?? 'rate-limit:';
	const key = `${keyPrefix}${identifier}`;

	if (!redis) {
		return fallbackWhenUnavailable(maxRequests, windowSeconds);
	}

	try {
		const now = Date.now();
		const windowStart = now - windowSeconds * 1000;

		// Count without modifying
		const current = await redis.zcount(key, windowStart, now);
		const allowed = current < maxRequests;

		// Get oldest entry for reset time
		const oldest = await redis.zrange(key, 0, 0, { withScores: true });
		const resetIn =
			oldest.length > 0
				? Math.ceil(
						(((oldest[0] as { score?: number }).score as number) +
							windowSeconds * 1000 -
							now) /
							1000
					)
				: windowSeconds;

		return {
			allowed,
			current,
			limit: maxRequests,
			resetIn: Math.max(0, resetIn),
			outcome: allowed ? 'allowed' : 'limit_exceeded'
		};
	} catch (error) {
		logRedisFailure(error);
		return fallbackWhenUnavailable(maxRequests, windowSeconds);
	}
}

import { getAppRevision, getAppVersion, getAppVersionId } from '$lib/appVersion';
import { readProcessEnv } from '$lib/parse';
import { rateLimit, RateLimitError } from '$lib/rateLimit';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from '@sveltejs/kit';

interface HealthResponse {
	status: 'ok' | 'degraded' | 'error';
	timestamp: string;
	uptime: number;
	environment: string;
	/** Semver from package.json */
	version: string;
	/** Short git SHA when available (Vercel / CI) */
	revision: string;
	/** Compact identity: `0.1.0` or `0.1.0+abcdef012345` */
	versionId: string;
	checks: {
		convex: {
			status: 'ok' | 'error';
			message?: string;
		};
		rateLimiter: {
			status: 'ok' | 'error';
			message?: string;
		};
	};
}

type NodeProcessLike = {
	uptime?: () => number;
};

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const startTime = Date.now();

	// Rate limit: 1000 requests per minute per IP (generous for monitoring)
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
	let rateLimiterMessage: string | undefined;
	try {
		const result = await rateLimit(clientIp, {
			windowSeconds: 60,
			maxRequests: 1000,
			keyPrefix: 'health:'
		});

		// Outside production the limiter fails open, so a broken Upstash still allows the
		// request and never throws. Inspect the outcome or the check silently reports "ok".
		if (result.outcome === 'limiter_unavailable') {
			rateLimiterMessage = 'Upstash unreachable or misconfigured (request allowed: fail-open)';
		}
	} catch (error) {
		if (error instanceof RateLimitError && error.outcome === 'limit_exceeded') {
			return new Response(JSON.stringify({ error: 'Too many requests' }), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': '60'
				}
			});
		}

		// Upstash is down or misconfigured. Report it as degraded rather than 429, so
		// monitoring sees the real dependency failure instead of a phantom rate limit.
		rateLimiterMessage = error instanceof Error ? error.message : 'Rate limiter unavailable';
	}

	const envMap = readProcessEnv();
	let uptime = 0;
	if ('process' in globalThis) {
		// SAFETY: Node attaches process on globalThis; optional uptime() after the `in` check.
		const proc = (globalThis as typeof globalThis & { process?: NodeProcessLike }).process;
		if (proc?.uptime) uptime = Math.floor(proc.uptime());
	}
	const nodeEnv = envMap?.NODE_ENV || 'unknown';
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL || envMap?.PUBLIC_CONVEX_URL;

	const response: HealthResponse = {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime,
		environment: nodeEnv,
		version: getAppVersion(),
		revision: getAppRevision(),
		versionId: getAppVersionId(),
		checks: {
			convex: { status: 'ok' },
			rateLimiter: { status: 'ok' }
		}
	};

	if (rateLimiterMessage) {
		response.checks.rateLimiter.status = 'error';
		response.checks.rateLimiter.message = rateLimiterMessage;
		response.status = 'degraded';
	}

	// Try to verify Convex connectivity by checking for the deployment URL
	if (!convexUrl) {
		response.checks.convex.status = 'error';
		response.checks.convex.message = 'CONVEX_URL not configured';
		response.status = 'degraded';
	} else {
		// Basic connectivity check: try to reach Convex (non-blocking)
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

			const result = await fetch(`${convexUrl}/version`, {
				method: 'GET',
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!result.ok) {
				response.checks.convex.status = 'error';
				response.checks.convex.message = `HTTP ${result.status}`;
				response.status = 'degraded';
			}
		} catch (error) {
			response.checks.convex.status = 'error';
			response.checks.convex.message = error instanceof Error ? error.message : 'Unknown error';
			response.status = 'degraded';
		}
	}

	const elapsed = Date.now() - startTime;
	const statusCode = response.status === 'ok' ? 200 : 503;

	return new Response(JSON.stringify(response), {
		status: statusCode,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'X-Response-Time': `${elapsed}ms`
		}
	});
};

import { rateLimit } from '$lib/rateLimit';
import type { RequestHandler } from '@sveltejs/kit';

interface HealthResponse {
	status: 'ok' | 'degraded' | 'error';
	timestamp: string;
	uptime: number;
	environment: string;
	checks: {
		convex: {
			status: 'ok' | 'error';
			message?: string;
		};
	};
}

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const startTime = Date.now();

	// Rate limit: 1000 requests per minute per IP (generous for monitoring)
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
	try {
		await rateLimit(clientIp, {
			windowSeconds: 60,
			maxRequests: 1000,
			keyPrefix: 'health:'
		});
	} catch (error) {
		// Rate limit exceeded
		return new Response(JSON.stringify({ error: 'Too many requests' }), {
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Retry-After': '60'
			}
		});
	}

	const proc = (globalThis as any).process;
	const uptime = proc?.uptime ? Math.floor(proc.uptime()) : 0;
	const nodeEnv = proc?.env?.NODE_ENV || 'unknown';
	const convexUrl = proc?.env?.PUBLIC_CONVEX_URL;

	const response: HealthResponse = {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime,
		environment: nodeEnv,
		checks: {
			convex: { status: 'ok' }
		}
	};

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

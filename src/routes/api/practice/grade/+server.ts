import { rateLimit } from '$lib/rateLimit';
import { api } from '$convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Protected API route for grading practice sessions.
 * Applies rate limiting before calling Convex mutation.
 *
 * POST /api/practice/grade
 * Body: { trackCode: string, mode?: 'sample' | 'full', answers: { order: number, selectedIndex: number }[] }
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

	try {
		await rateLimit(clientIp, {
			windowSeconds: 60,
			maxRequests: 10,
			keyPrefix: 'grade:'
		});
	} catch {
		return new Response(
			JSON.stringify({
				error: 'Too many practice submissions. Please wait before submitting again.',
				retryAfter: 60
			}),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': '60',
					'X-RateLimit-Limit': '10',
					'X-RateLimit-Window': '60s'
				}
			}
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { trackCode, answers, mode = 'sample', sessionSeed } = body;
	const practiceMode = mode === 'full' ? 'full' : 'sample';

	if (!trackCode || !Array.isArray(answers)) {
		return new Response(JSON.stringify({ error: 'Missing trackCode or answers array' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (practiceMode === 'full' && (!sessionSeed || typeof sessionSeed !== 'string')) {
		return new Response(JSON.stringify({ error: 'Missing sessionSeed for full mock' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
		if (!convexUrl) {
			return new Response(JSON.stringify({ error: 'Convex not configured' }), {
				status: 503,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const convex = new ConvexHttpClient(convexUrl);

		if (practiceMode === 'full') {
			const workosToken = cookies.get('workos_token');
			if (!workosToken) {
				return new Response(JSON.stringify({ error: 'Not authenticated' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}
			convex.setAuth(workosToken);
		}

		const result = await convex.mutation(api.practiceQuestions.gradeAnswers, {
			trackCode,
			mode: practiceMode,
			...(practiceMode === 'full' ? { sessionSeed } : {}),
			answers
		});

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache, no-store, must-revalidate'
			}
		});
	} catch (error) {
		console.error('Grade mutation error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Failed to grade answers'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

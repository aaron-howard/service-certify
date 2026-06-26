import { rateLimit } from '$lib/rateLimit';
import { api } from '$convex/_generated/api';
import { ConvexClient } from 'convex/browser';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Protected API route for grading practice sessions.
 * Applies rate limiting before calling Convex mutation.
 *
 * POST /api/practice/grade
 * Body: { trackCode: string, answers: { order: number, selectedIndex: number }[] }
 */
export const POST: RequestHandler = async ({ request }) => {
	// Rate limit: 10 submissions per minute per IP
	// (prevents abuse from automated test tools)
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

	try {
		await rateLimit(clientIp, {
			windowSeconds: 60,
			maxRequests: 10,
			keyPrefix: 'grade:'
		});
	} catch (error) {
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

	// Parse request body
	let body;
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { trackCode, answers } = body;

	// Validate inputs
	if (!trackCode || !Array.isArray(answers)) {
		return new Response(
			JSON.stringify({ error: 'Missing trackCode or answers array' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// Call Convex mutation
	// Note: In Phase C, you'll wire this to your auth context
	try {
		const convexUrl = ((globalThis as any).process?.env?.PUBLIC_CONVEX_URL as string);
		if (!convexUrl) {
			return new Response(JSON.stringify({ error: 'Convex not configured' }), {
				status: 503,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const convex = new ConvexClient(convexUrl);
		const result = await convex.mutation(api.practiceQuestions.gradeAnswers, {
			trackCode,
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

import { rateLimit, RateLimitError } from '$lib/rateLimit';
import { api } from '$convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import { readString } from '$lib/parse';
import { resolveWorkOsSession } from '$lib/workos-session';
import type { RequestHandler } from '@sveltejs/kit';

type GradeAnswer = {
	order: number;
	selectedIndex: number;
	selectedIndexes?: number[];
	matchAnswers?: { left: number; right: number }[];
};

type GradeMutationArgs = {
	trackCode: string;
	mode: 'sample' | 'full';
	sessionSeed?: string;
	answers: GradeAnswer[];
};

/**
 * Protected API route for grading practice sessions.
 * Applies rate limiting before calling Convex mutation.
 *
 * POST /api/practice/grade
 * Body: { trackCode: string, mode?: 'sample' | 'full', answers: { order: number, selectedIndex: number }[] }
 */
export const POST: RequestHandler = async ({ request, cookies, locals, url }) => {
	const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
	const rateLimitKey = locals.workosUserId ?? clientIp;

	try {
		await rateLimit(rateLimitKey, {
			windowSeconds: 60,
			maxRequests: 10,
			keyPrefix: locals.workosUserId ? 'grade:user:' : 'grade:ip:'
		});
	} catch (error) {
		if (!(error instanceof RateLimitError)) {
			throw error;
		}

		if (error.outcome === 'limiter_unavailable') {
			// Upstash is unreachable or misconfigured. Surface it as a dependency failure so it
			// reaches Sentry instead of hiding behind a "you submitted too fast" message.
			const { captureException } = await import('$lib/sentry');
			captureException(error, { phase: 'practice_grade_rate_limiter_unavailable' });

			return new Response(
				JSON.stringify({
					error:
						'Grading is temporarily unavailable. Your answers are still on this page — please try submitting again in a moment.',
					retryAfter: error.result.resetIn
				}),
				{
					status: error.status,
					headers: {
						'Content-Type': 'application/json',
						...error.headers
					}
				}
			);
		}

		return new Response(
			JSON.stringify({
				error: 'Too many practice submissions. Please wait before submitting again.',
				retryAfter: error.result.resetIn
			}),
			{
				status: error.status,
				headers: {
					'Content-Type': 'application/json',
					'X-RateLimit-Window': '60s',
					...error.headers
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
	const sessionSeedValue = readString(sessionSeed);

	if (!trackCode || !Array.isArray(answers)) {
		return new Response(JSON.stringify({ error: 'Missing trackCode or answers array' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (practiceMode === 'full' && !sessionSeedValue) {
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
			const secure = url.protocol === 'https:';
			const session =
				locals.workosToken && locals.workosUserId
					? { accessToken: locals.workosToken, userId: locals.workosUserId }
					: await resolveWorkOsSession(cookies, secure);
			if (!session) {
				return new Response(
					JSON.stringify({
						error: 'Your session expired. Sign in again to submit your full mock exam.'
					}),
					{
						status: 401,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
			convex.setAuth(session.accessToken);
		}

		const gradeArgs: GradeMutationArgs = {
			trackCode,
			mode: practiceMode,
			// SAFETY: request.json() answers validated as an array; Convex validators enforce shape.
			answers: answers as GradeAnswer[]
		};
		if (practiceMode === 'full' && sessionSeedValue) {
			gradeArgs.sessionSeed = sessionSeedValue;
		}

		const result = await convex.mutation(api.practiceQuestions.gradeAnswers, gradeArgs);

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache, no-store, must-revalidate'
			}
		});
	} catch (error) {
		console.error('Grade mutation error:', error);
		const { captureException } = await import('$lib/sentry');
		captureException(error, { phase: 'practice_grade', trackCode, mode: practiceMode });
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

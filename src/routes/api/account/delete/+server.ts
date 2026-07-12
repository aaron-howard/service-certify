import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { api } from '$convex/_generated/api.js';
import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import {
	clearWorkOsAuthCookies,
	isAccessTokenExpired,
	isRecentAuthentication
} from '$lib/workos-session';
import {
	DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS,
	stepUpStartPath
} from '$lib/workos-step-up';

export const POST: RequestHandler = async ({ cookies }) => {
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return json({ error: 'Convex is not configured' }, { status: 503 });
	}

	const workosToken = cookies.get('workos_token');
	if (!workosToken || isAccessTokenExpired(workosToken)) {
		if (workosToken) clearWorkOsAuthCookies(cookies);
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	if (!isRecentAuthentication(workosToken, DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS)) {
		return json(
			{
				error: 'step_up_required',
				message: 'Verify your identity before deleting your account.',
				stepUpUrl: stepUpStartPath('delete-account', '/settings?step_up=delete-account')
			},
			{ status: 403 }
		);
	}

	const convex = new ConvexHttpClient(convexUrl);
	convex.setAuth(workosToken);

	try {
		await convex.mutation(api.auth.deleteAccount, {});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not delete account';
		return json({ error: message }, { status: 500 });
	}

	clearWorkOsAuthCookies(cookies);
	return json({ ok: true });
};

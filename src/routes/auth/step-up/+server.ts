import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	getAuthKitStepUpAuthorizationUrl,
	getWorkOS,
	isWorkOSConfigured
} from '$lib/workos.server';
import {
	isStepUpIntent,
	stepUpRedirectPath,
	type StepUpIntent
} from '$lib/workos-step-up';
import { isAccessTokenExpired } from '$lib/workos-session';

const STEP_UP_COOKIE = 'auth_step_up_intent';

export const GET: RequestHandler = async ({ url, cookies }) => {
	if (!isWorkOSConfigured()) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	const workosToken = cookies.get('workos_token');
	const workosUserId = cookies.get('workos_user_id');
	if (!workosToken || !workosUserId || isAccessTokenExpired(workosToken)) {
		const redirectTarget = `/settings${url.search}`;
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(redirectTarget)}`);
	}

	const intentParam = url.searchParams.get('intent');
	if (!isStepUpIntent(intentParam)) {
		throw redirect(302, '/settings');
	}
	const intent: StepUpIntent = intentParam;

	const postAuthRedirect = url.searchParams.get('redirect');
	const defaultRedirect = stepUpRedirectPath(intent);
	const redirectPath =
		postAuthRedirect?.startsWith('/') && !postAuthRedirect.startsWith('//')
			? postAuthRedirect
			: defaultRedirect;

	cookies.set('auth_redirect', redirectPath, {
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		path: '/',
		maxAge: 10 * 60
	});

	cookies.set(STEP_UP_COOKIE, intent, {
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		path: '/',
		maxAge: 10 * 60
	});

	let loginHint: string | undefined;
	const workos = getWorkOS();
	if (workos) {
		try {
			const user = await workos.userManagement.getUser(workosUserId);
			loginHint = user.email;
		} catch {
			// Step-up still works without login_hint.
		}
	}

	const authorizationUrl = getAuthKitStepUpAuthorizationUrl(url.origin, {
		maxAge: 0,
		loginHint
	});

	if (!authorizationUrl) {
		throw redirect(302, '/auth/signin?error=workos_not_configured');
	}

	throw redirect(302, authorizationUrl);
};

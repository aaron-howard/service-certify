import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isRecentAuthentication } from '$lib/workos-session';
import {
	DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS,
	isStepUpIntent,
	stepUpStartPath
} from '$lib/workos-step-up';

export const load: PageServerLoad = async ({ parent, url, cookies }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(url.pathname)}`);
	}

	const workosToken = cookies.get('workos_token');
	const deleteAuthFresh = workosToken
		? isRecentAuthentication(workosToken, DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS)
		: false;

	const stepUpParam = url.searchParams.get('step_up');
	const stepUpCompleted = isStepUpIntent(stepUpParam) && stepUpParam === 'delete-account';

	return {
		user,
		deleteAuthFresh,
		stepUpCompleted,
		stepUpUrl: stepUpStartPath('delete-account', '/settings?step_up=delete-account')
	};
};

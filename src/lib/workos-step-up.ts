/** WorkOS step-up intents supported by `/auth/step-up`. */
export const STEP_UP_INTENTS = ['delete-account'] as const;

export type StepUpIntent = (typeof STEP_UP_INTENTS)[number];

/** Freshness window after step-up before delete is allowed (5 minutes). */
export const DELETE_ACCOUNT_STEP_UP_MAX_AGE_SECONDS = 300;

export function isStepUpIntent(value: string | null): value is StepUpIntent {
	return value !== null && (STEP_UP_INTENTS as readonly string[]).includes(value);
}

export function stepUpRedirectPath(intent: StepUpIntent): string {
	if (intent === 'delete-account') {
		return `/settings?step_up=${intent}`;
	}
	return '/settings';
}

export function stepUpStartPath(intent: StepUpIntent, redirectPath?: string): string {
	const params = new URLSearchParams({ intent });
	if (redirectPath?.startsWith('/')) {
		params.set('redirect', redirectPath);
	}
	return `/auth/step-up?${params.toString()}`;
}

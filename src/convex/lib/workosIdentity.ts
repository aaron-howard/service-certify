import type { UserIdentity } from 'convex/server';

const WORKOS_USER_ID_PATTERN = /^user_[A-Za-z0-9]+$/;

/** Extract the WorkOS user id (`user_…`) from a Convex auth identity. */
export function workosUserIdFromIdentity(identity: UserIdentity): string | null {
	if (WORKOS_USER_ID_PATTERN.test(identity.subject)) {
		return identity.subject;
	}

	const tokenIdentifier = identity.tokenIdentifier;
	if (tokenIdentifier) {
		const suffix = tokenIdentifier.split('|').pop();
		if (suffix && WORKOS_USER_ID_PATTERN.test(suffix)) {
			return suffix;
		}
	}

	return WORKOS_USER_ID_PATTERN.test(identity.subject) ? identity.subject : null;
}

/** Prefer JWT email when present; fall back to the WorkOS profile email from SvelteKit sync. */
export function canonicalAuthEmail(identity: UserIdentity, profileEmail: string): string {
	const jwtEmail = identity.email?.trim();
	return (jwtEmail || profileEmail).trim();
}

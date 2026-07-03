import { getWorkOS } from '$lib/workos.server';

export type SessionUser = {
	id: string;
	email: string;
	name: string;
};

/** Resolve the signed-in user from WorkOS session cookies set in hooks.server.ts. */
export async function getSessionUser(locals: App.Locals): Promise<SessionUser | null> {
	const userId = locals.workosUserId;
	if (!userId) return null;

	const workos = getWorkOS();
	if (!workos) return null;

	try {
		const user = await workos.userManagement.getUser(userId);
		const name =
			[user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
		return { id: user.id, email: user.email, name };
	} catch {
		return null;
	}
}

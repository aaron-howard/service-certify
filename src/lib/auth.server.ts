import { getWorkOS } from '$lib/workos.server';
import { getConvexCurrentUser, resolveConvexUser } from '$lib/convex.server';
import { resolveWorkOSDisplayName, resolveWorkOSProfileImage } from '$lib/workos-user';
import type { OAuthProviderSlug } from '$lib/workos.server';
import type { ConvexUserSession, ConvexUserSyncArgs } from '$lib/convex.server';

export type UserRole = 'user' | 'admin';

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	isAdmin: boolean;
	profileImage?: string;
	provider?: string;
};

export type SessionLocals = {
	workosUserId?: string;
	workosToken?: string;
};

export type WorkOsUserManagement = {
	getUser: (userId: string) => Promise<{
		id: string;
		email: string;
		firstName?: string | null;
		lastName?: string | null;
		name?: string | null;
		profilePictureUrl?: string | null;
	}>;
};

export type SessionUserDeps = {
	getConvexCurrentUser: (workosToken: string) => Promise<ConvexUserSession | null>;
	resolveConvexUser: (args: ConvexUserSyncArgs) => Promise<ConvexUserSession>;
	getWorkOS: () => { userManagement: WorkOsUserManagement } | null;
};

const defaultSessionUserDeps: SessionUserDeps = {
	getConvexCurrentUser,
	resolveConvexUser,
	getWorkOS
};

/** Map WorkOS user + optional login provider into Convex sync payload. */
export function buildConvexUserSyncPayload(
	user: {
		id: string;
		email: string;
		firstName?: string | null;
		lastName?: string | null;
		name?: string | null;
		profilePictureUrl?: string | null;
	},
	provider?: OAuthProviderSlug
) {
	return {
		workosId: user.id,
		email: user.email,
		name: resolveWorkOSDisplayName(user),
		profileImage: resolveWorkOSProfileImage(user),
		provider
	};
}

/**
 * Resolve the signed-in user from WorkOS session cookies set in hooks.server.ts.
 *
 * Hot path: Convex getCurrentUser only (no WorkOS API, no mutation).
 * Cold path (first visit / missing Convex row): WorkOS getUser + upsert.
 */
export async function getSessionUser(
	locals: SessionLocals,
	deps: SessionUserDeps = defaultSessionUserDeps
): Promise<SessionUser | null> {
	const userId = locals.workosUserId;
	const workosToken = locals.workosToken;
	if (!userId || !workosToken) return null;

	try {
		const existing = await deps.getConvexCurrentUser(workosToken);
		if (existing?.email) {
			return {
				id: userId,
				email: existing.email,
				name: existing.name ?? existing.email,
				role: existing.role,
				isAdmin: existing.role === 'admin',
				profileImage: existing.profileImage,
				provider: existing.provider
			};
		}

		const workos = deps.getWorkOS();
		if (!workos) return null;

		const user = await workos.userManagement.getUser(userId);
		const syncPayload = buildConvexUserSyncPayload(user);
		const convexUser = await deps.resolveConvexUser({ ...syncPayload, workosToken });

		return {
			id: user.id,
			email: user.email,
			name: convexUser.name ?? syncPayload.name ?? user.email,
			role: convexUser.role,
			isAdmin: convexUser.role === 'admin',
			profileImage: convexUser.profileImage ?? syncPayload.profileImage,
			provider: convexUser.provider ?? syncPayload.provider
		};
	} catch {
		return null;
	}
}

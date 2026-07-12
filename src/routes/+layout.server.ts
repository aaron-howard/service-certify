import { getSessionUser } from '$lib/auth.server';
import { resolveDeployEnvironment } from '$lib/deployEnvironment';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await getSessionUser(locals);
	const deployEnvironment = resolveDeployEnvironment(env.VERCEL_ENV, env.NODE_ENV);
	return { user, deployEnvironment };
};

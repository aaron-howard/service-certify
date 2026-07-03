import { getSessionUser } from '$lib/auth.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await getSessionUser(locals);
	return { user };
};

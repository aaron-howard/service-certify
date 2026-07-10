import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Dashboard requires sign-in so progress queries can use the WorkOS JWT. */
export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(url.pathname)}`);
	}
	return { user };
};

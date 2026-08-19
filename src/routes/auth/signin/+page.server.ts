import type { PageServerLoad } from './$types';
import { safeInternalRedirect } from '$lib/safeRedirect';
import { isWorkOSConfigured } from '$lib/workos.server';

export const load: PageServerLoad = ({ url }) => {
	return {
		configured: isWorkOSConfigured(),
		error: url.searchParams.get('error'),
		redirect: safeInternalRedirect(url.searchParams.get('redirect'))
	};
};

import type { PageServerLoad } from './$types';
import { isWorkOSConfigured } from '$lib/workos.server';

export const load: PageServerLoad = ({ url }) => {
	const redirect = url.searchParams.get('redirect');
	return {
		configured: isWorkOSConfigured(),
		error: url.searchParams.get('error'),
		redirect: redirect && redirect.startsWith('/') ? redirect : null
	};
};

import type { PageServerLoad } from './$types';
import { isWorkOSConfigured } from '$lib/workos.server';

export const load: PageServerLoad = ({ url }) => {
	return {
		configured: isWorkOSConfigured(),
		error: url.searchParams.get('error')
	};
};

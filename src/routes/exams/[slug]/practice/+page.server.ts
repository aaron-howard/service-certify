import { error, redirect } from '@sveltejs/kit';
import { getExamBySlug } from '$lib/data/exams';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, parent }) => {
	const exam = getExamBySlug(params.slug);
	if (!exam) error(404, 'Exam not found');

	const mode = url.searchParams.get('mode') === 'full' ? 'full' : 'sample';
	const { user } = await parent();

	if (mode === 'full' && !user?.isAdmin) {
		const redirectTo = `/exams/${params.slug}/practice?mode=full`;
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
	}

	return { exam, mode };
};

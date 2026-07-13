import { error } from '@sveltejs/kit';
import { getExamBySlug } from '$lib/data/exams';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const exam = getExamBySlug(params.slug);
	if (!exam) error(404, 'Exam not found');

	const { user } = await parent();
	return { exam, user };
};

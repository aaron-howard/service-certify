import { error } from '@sveltejs/kit';
import { getExamBySlug } from '$lib/data/exams';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const exam = getExamBySlug(params.slug);
	if (!exam) error(404, 'Exam not found');
	return { exam };
};

import { error, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { getExamBySlug } from '$lib/data/exams';
import { loadPracticeQuestions } from '$lib/practice.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, parent, cookies }) => {
	const exam = getExamBySlug(params.slug);
	if (!exam) error(404, 'Exam not found');

	const mode = url.searchParams.get('mode') === 'full' ? 'full' : 'sample';
	const { user } = await parent();

	if (mode === 'full' && !user?.isAdmin) {
		const redirectTo = `/exams/${params.slug}/practice?mode=full`;
		throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
	}

	let serverQuestions: Awaited<ReturnType<typeof loadPracticeQuestions>> | null = null;
	let questionsError: string | null = null;
	const sessionSeed = mode === 'full' && user?.isAdmin ? randomUUID() : null;

	if (mode === 'full' && user?.isAdmin && sessionSeed) {
		try {
			serverQuestions = await loadPracticeQuestions({
				trackCode: exam.code,
				mode: 'full',
				workosToken: cookies.get('workos_token'),
				sessionSeed
			});
		} catch (err) {
			questionsError =
				err instanceof Error ? err.message : 'Could not load full mock questions';
			console.error('Full mock question load failed:', err);
		}
	}

	return { exam, mode, serverQuestions, questionsError, sessionSeed };
};

import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env as publicEnv } from '$env/dynamic/public';

export type PracticeQuestionRow = {
	order: number;
	prompt: string;
	choices: string[];
	questionType?: 'single' | 'multi' | 'match';
	matchLeftItems?: string[];
	matchRightItems?: string[];
	explanation: string;
};

/** Load practice questions with the user's WorkOS JWT (server-side, httpOnly cookie). */
export async function loadPracticeQuestions(args: {
	trackCode: string;
	mode: 'sample' | 'full';
	workosToken?: string;
	sessionSeed?: string;
}): Promise<PracticeQuestionRow[]> {
	const convexUrl = publicEnv.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error('PUBLIC_CONVEX_URL is not configured');
	}

	const client = new ConvexHttpClient(convexUrl);

	if (args.mode === 'full') {
		if (!args.workosToken) {
			throw new Error('Not authenticated');
		}
		client.setAuth(args.workosToken);
	}

	return await client.query(api.practiceQuestions.listByTrackCode, {
		trackCode: args.trackCode,
		mode: args.mode,
		...(args.sessionSeed ? { sessionSeed: args.sessionSeed } : {})
	});
}

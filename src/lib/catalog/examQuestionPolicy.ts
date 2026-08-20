/**
 * Official ServiceNow mainline exam question counts (Credentialing Program Guide)
 * and derived practice-bank targets (+30 buffer for randomized full mocks).
 */
export const QUESTION_BANK_BUFFER = 30;

/** Official proctored exam question count per track code. */
export const OFFICIAL_EXAM_QUESTION_COUNTS = {
	CSA: 60,
	CAD: 60,
	'CIS-DF': 75,
	'CIS-PA': 60,
	'CIS-SP': 45,
	CPOA: 70,
	CPOP: 70,
	CPOE: 192,
	'CIS-DISCO': 45,
	'CIS-EM': 30,
	'CIS-HAM': 60,
	'CIS-ITSM': 60,
	'CIS-RC': 60,
	'CIS-SIR': 60,
	'CIS-SM': 60,
	'CIS-SAM': 60,
	'CIS-SPM': 60,
	'CIS-TPRM': 60,
	'CIS-VR': 45,
	'CIS-CSM': 60,
	'CIS-FSM': 60,
	'CIS-HR': 60
} as const;

export type OfficialExamTrackCode = keyof typeof OFFICIAL_EXAM_QUESTION_COUNTS;

function officialCountForTrack(trackCode: string): number | undefined {
	for (const [code, count] of Object.entries(OFFICIAL_EXAM_QUESTION_COUNTS)) {
		if (code === trackCode) return count;
	}
	return undefined;
}

export function getOfficialQuestionCount(trackCode: string): number {
	const count = officialCountForTrack(trackCode);
	if (count === undefined) {
		throw new Error(`Unknown track code for official question count: ${trackCode}`);
	}
	return count;
}

/** Target seeded bank size: official count + buffer for rotation between attempts. */
export function getQuestionBankTarget(trackCode: string): number {
	return getOfficialQuestionCount(trackCode) + QUESTION_BANK_BUFFER;
}

/** Bank seed targets keyed by track code (used by dev question bank and tests). */
export const EXAM_QUESTION_BANK_TARGETS = Object.fromEntries(
	Object.keys(OFFICIAL_EXAM_QUESTION_COUNTS).map((code) => [
		code,
		getQuestionBankTarget(code)
	])
);

/** Official proctored exam time limits (minutes), from Credentialing Program Guide. */
export const OFFICIAL_EXAM_DURATION_MINUTES = {
	'CIS-SP': 60,
	CPOE: 240
} as const;

const DEFAULT_EXAM_DURATION_MINUTES = 90;

export function getOfficialExamDurationMinutes(trackCode: string): number {
	for (const [code, minutes] of Object.entries(OFFICIAL_EXAM_DURATION_MINUTES)) {
		if (code === trackCode) return minutes;
	}
	return DEFAULT_EXAM_DURATION_MINUTES;
}

export function getOfficialExamDurationSeconds(trackCode: string): number {
	return getOfficialExamDurationMinutes(trackCode) * 60;
}

/** Timed practice allowance scaled to questions served in this session. */
export function getPracticeTimeSeconds(args: {
	trackCode: string;
	questionCount: number;
	mode: 'sample' | 'full';
}): number {
	const officialSeconds = getOfficialExamDurationSeconds(args.trackCode);
	if (args.mode === 'full') {
		return officialSeconds;
	}
	const officialCount = getOfficialQuestionCount(args.trackCode);
	const scaled = Math.round((officialSeconds * args.questionCount) / officialCount);
	return Math.max(300, scaled);
}

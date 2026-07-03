/**
 * Official ServiceNow mainline exam question counts (Credentialing Program Guide)
 * and derived practice-bank targets (+30 buffer for randomized full mocks).
 */
export const QUESTION_BANK_BUFFER = 30;

/** Official proctored exam question count per track code. */
export const OFFICIAL_EXAM_QUESTION_COUNTS: Record<string, number> = {
	CSA: 60,
	CAD: 60,
	'CIS-DF': 75,
	'CIS-PA': 60,
	'CIS-SP': 45,
	CPOA: 70,
	CPOP: 192,
	CPOE: 180,
	'CIS-DISCO': 60,
	'CIS-EM': 30,
	'CIS-HAM': 60,
	'CIS-ITSM': 60,
	'CIS-RC': 60,
	'CIS-SIR': 60,
	'CIS-SM': 60,
	'CIS-SAM': 60,
	'CIS-SPM': 60,
	'CIS-TPRM': 60,
	'CIS-VR': 60,
	'CIS-CSM': 60,
	'CIS-FSM': 60,
	'CIS-HR': 60
};

export function getOfficialQuestionCount(trackCode: string): number {
	const count = OFFICIAL_EXAM_QUESTION_COUNTS[trackCode];
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
export const EXAM_QUESTION_BANK_TARGETS: Record<string, number> = Object.fromEntries(
	Object.keys(OFFICIAL_EXAM_QUESTION_COUNTS).map((code) => [
		code,
		getQuestionBankTarget(code)
	])
);

/** Official proctored exam time limits (minutes), from Credentialing Program Guide. */
export const OFFICIAL_EXAM_DURATION_MINUTES: Record<string, number> = {
	CPOP: 240,
	CPOE: 240
};

const DEFAULT_EXAM_DURATION_MINUTES = 90;

export function getOfficialExamDurationMinutes(trackCode: string): number {
	return OFFICIAL_EXAM_DURATION_MINUTES[trackCode] ?? DEFAULT_EXAM_DURATION_MINUTES;
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

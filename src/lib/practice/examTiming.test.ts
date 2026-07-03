import { describe, expect, it } from 'vitest';
import {
	getOfficialExamDurationMinutes,
	getOfficialExamDurationSeconds,
	getPracticeTimeSeconds
} from '$lib/catalog/examQuestionPolicy';

describe('exam timing policy', () => {
	it('uses 90 minutes for standard mainline exams', () => {
		expect(getOfficialExamDurationMinutes('CIS-DISCO')).toBe(90);
		expect(getOfficialExamDurationSeconds('CSA')).toBe(90 * 60);
	});

	it('uses 4 hours for CPOP and CPOE', () => {
		expect(getOfficialExamDurationMinutes('CPOP')).toBe(240);
		expect(getOfficialExamDurationMinutes('CPOE')).toBe(240);
	});

	it('allocates full official time for full mocks', () => {
		expect(
			getPracticeTimeSeconds({ trackCode: 'CIS-DISCO', questionCount: 60, mode: 'full' })
		).toBe(90 * 60);
	});

	it('scales sample time to question count with a minimum floor', () => {
		expect(
			getPracticeTimeSeconds({ trackCode: 'CIS-DISCO', questionCount: 3, mode: 'sample' })
		).toBe(300);
	});
});

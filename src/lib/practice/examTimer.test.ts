import { describe, expect, it } from 'vitest';
import { getTimerWarningLevel, timerWarningMessage } from './examTimer';

describe('examTimer', () => {
	it('returns warning levels at thresholds', () => {
		expect(getTimerWarningLevel(301)).toBe('none');
		expect(getTimerWarningLevel(300)).toBe('five_minutes');
		expect(getTimerWarningLevel(61)).toBe('five_minutes');
		expect(getTimerWarningLevel(60)).toBe('one_minute');
		expect(getTimerWarningLevel(1)).toBe('one_minute');
		expect(getTimerWarningLevel(0)).toBe('expired');
	});

	it('returns messages for active warnings', () => {
		expect(timerWarningMessage('five_minutes')).toContain('5 minutes');
		expect(timerWarningMessage('one_minute')).toContain('1 minute');
		expect(timerWarningMessage('expired')).toContain('Time is up');
		expect(timerWarningMessage('none')).toBeNull();
	});
});

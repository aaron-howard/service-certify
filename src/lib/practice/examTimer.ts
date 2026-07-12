export const TIMER_WARN_FIVE_MINUTES = 5 * 60;
export const TIMER_WARN_ONE_MINUTE = 60;

export type TimerWarningLevel = 'none' | 'five_minutes' | 'one_minute' | 'expired';

export function getTimerWarningLevel(remainingSeconds: number): TimerWarningLevel {
	if (remainingSeconds <= 0) return 'expired';
	if (remainingSeconds <= TIMER_WARN_ONE_MINUTE) return 'one_minute';
	if (remainingSeconds <= TIMER_WARN_FIVE_MINUTES) return 'five_minutes';
	return 'none';
}

export function timerWarningMessage(level: TimerWarningLevel): string | null {
	switch (level) {
		case 'five_minutes':
			return '5 minutes remaining';
		case 'one_minute':
			return '1 minute remaining — finish up soon';
		case 'expired':
			return 'Time is up — submitting your exam';
		default:
			return null;
	}
}

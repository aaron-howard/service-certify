export type QuestionStatus = 'unanswered' | 'answered' | 'flagged';

export function clampIndex(index: number, total: number): number {
	if (total <= 0) return 0;
	return Math.min(Math.max(0, index), total - 1);
}

export function unansweredIndexes(
	total: number,
	isAnswered: (index: number) => boolean
): number[] {
	const missing: number[] = [];
	for (let i = 0; i < total; i++) {
		if (!isAnswered(i)) missing.push(i);
	}
	return missing;
}

export function questionStatus(
	index: number,
	isAnswered: (index: number) => boolean,
	flagged: Set<number>
): QuestionStatus {
	if (flagged.has(index)) return 'flagged';
	return isAnswered(index) ? 'answered' : 'unanswered';
}

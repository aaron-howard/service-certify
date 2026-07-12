export type PracticePhase = 'intro' | 'live' | 'review' | 'summary';

export type KeyboardAction =
	| 'previous'
	| 'next'
	| 'flag'
	| 'palette'
	| 'closeModal'
	| 'submit';

export type KeyboardContext = {
	phase: PracticePhase;
	currentIndex: number;
	total: number;
	disabled: boolean;
	paletteOpen: boolean;
	submitModalOpen: boolean;
};

/** True when the user is typing in a form control — skip exam shortcuts. */
export function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Map a keydown event to a practice-exam action, or null if unhandled.
 * Arrow keys navigate; F flags; P opens palette; Escape closes modals.
 */
export function practiceKeyAction(
	key: string,
	ctx: KeyboardContext,
	opts?: { typing?: boolean }
): KeyboardAction | null {
	if (opts?.typing ?? false) return null;

	if (ctx.submitModalOpen || ctx.paletteOpen) {
		return key === 'Escape' ? 'closeModal' : null;
	}

	if (ctx.disabled) return null;

	if (key === 'Escape') return null;

	if (ctx.phase === 'live' || ctx.phase === 'review') {
		if (key === 'ArrowLeft' && ctx.currentIndex > 0) return 'previous';
		if (key === 'ArrowRight' && ctx.currentIndex < ctx.total - 1) return 'next';
		if (key === 'p' || key === 'P') return 'palette';
	}

	if (ctx.phase === 'live') {
		if (key === 'f' || key === 'F') return 'flag';
	}

	return null;
}

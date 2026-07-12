import { describe, expect, it } from 'vitest';
import { isTypingTarget, practiceKeyAction } from './sessionKeyboard';

const baseCtx = {
	phase: 'live' as const,
	currentIndex: 2,
	total: 10,
	disabled: false,
	paletteOpen: false,
	submitModalOpen: false
};

describe('sessionKeyboard', () => {
	it('isTypingTarget detects form controls', () => {
		const input = document.createElement('input');
		expect(isTypingTarget(input)).toBe(true);
		expect(isTypingTarget(document.createElement('button'))).toBe(false);
	});

	it('ArrowLeft/Right navigate during live exam', () => {
		expect(practiceKeyAction('ArrowLeft', baseCtx)).toBe('previous');
		expect(practiceKeyAction('ArrowRight', baseCtx)).toBe('next');
	});

	it('blocks navigation at bounds', () => {
		expect(practiceKeyAction('ArrowLeft', { ...baseCtx, currentIndex: 0 })).toBeNull();
		expect(
			practiceKeyAction('ArrowRight', { ...baseCtx, currentIndex: 9, total: 10 })
		).toBeNull();
	});

	it('F flags and P opens palette in live phase', () => {
		expect(practiceKeyAction('f', baseCtx)).toBe('flag');
		expect(practiceKeyAction('P', baseCtx)).toBe('palette');
	});

	it('ignores exam shortcuts when modal is open', () => {
		const modalCtx = { ...baseCtx, paletteOpen: true };
		expect(practiceKeyAction('ArrowRight', modalCtx)).toBeNull();
		expect(practiceKeyAction('Escape', modalCtx)).toBe('closeModal');
	});

	it('ignores shortcuts when typing', () => {
		expect(practiceKeyAction('ArrowRight', baseCtx, { typing: true })).toBeNull();
	});

	it('allows review navigation without flag', () => {
		const review = { ...baseCtx, phase: 'review' as const };
		expect(practiceKeyAction('f', review)).toBeNull();
		expect(practiceKeyAction('ArrowLeft', review)).toBe('previous');
	});
});

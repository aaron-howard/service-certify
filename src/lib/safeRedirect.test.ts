import { describe, expect, it } from 'vitest';
import { safeInternalRedirect } from './safeRedirect';

describe('safeInternalRedirect', () => {
	it('allows same-origin relative paths with query and hash', () => {
		expect(safeInternalRedirect('/dashboard')).toBe('/dashboard');
		expect(safeInternalRedirect('/exams/csa/practice?mode=full')).toBe(
			'/exams/csa/practice?mode=full'
		);
		expect(safeInternalRedirect('/settings?step_up=delete-account#danger')).toBe(
			'/settings?step_up=delete-account#danger'
		);
	});

	it('rejects protocol-relative and absolute external URLs', () => {
		expect(safeInternalRedirect('//evil.example')).toBeNull();
		expect(safeInternalRedirect('//evil.example/phish')).toBeNull();
		expect(safeInternalRedirect('https://evil.example/')).toBeNull();
		expect(safeInternalRedirect('http://evil.example/')).toBeNull();
		expect(safeInternalRedirect('https://evil.example')).toBeNull();
	});

	it('rejects backslash and scheme tricks', () => {
		expect(safeInternalRedirect('/\\evil.example')).toBeNull();
		expect(safeInternalRedirect('\\evil.example')).toBeNull();
		expect(safeInternalRedirect('javascript:alert(1)')).toBeNull();
		expect(safeInternalRedirect('dashboard')).toBeNull();
		expect(safeInternalRedirect('')).toBeNull();
		expect(safeInternalRedirect(null)).toBeNull();
		expect(safeInternalRedirect(undefined)).toBeNull();
	});
});

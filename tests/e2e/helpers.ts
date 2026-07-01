import type { Page } from '@playwright/test';

/** Exam catalog cards link to `/exams/{slug}` (not the catalog index). */
export function examCardLinks(page: Page) {
	return page.locator('a[href^="/exams/"]');
}

export async function gotoFirstExam(page: Page) {
	await page.goto('/exams');
	await page.waitForLoadState('domcontentloaded');
	const firstExam = examCardLinks(page).first();
	await firstExam.waitFor({ state: 'visible' });
	await firstExam.click();
	await page.waitForURL(/\/exams\/[^/]+$/);
}

export async function gotoFirstPractice(page: Page) {
	await gotoFirstExam(page);
	const practiceBtn = page.locator('a:has-text("Practice"), button:has-text("Practice")').first();
	await practiceBtn.click();
	await page.waitForURL(/\/exams\/[^/]+\/practice/);
}

/** Practice page shows Convex questions or a documented empty state when Convex is not configured. */
export async function hasPracticeQuestions(page: Page) {
	const empty = page.getByText(/No practice questions/i);
	if (await empty.isVisible().catch(() => false)) return false;
	return page.locator('article h2').first().isVisible().catch(() => false);
}

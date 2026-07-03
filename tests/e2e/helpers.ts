import { expect, type Page } from '@playwright/test';

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
	await waitForPracticeContent(page);
}

export function practiceQuestionHeading(page: Page) {
	return page.locator('article h2').first();
}

/** Practice page empty state when Convex is missing or the track has no seeded questions. */
export function practiceEmptyState(page: Page) {
	return page.getByText(/No practice questions|Practice questions require Convex/i);
}

/** Wait until the practice page shows questions or a documented empty state. */
export async function waitForPracticeContent(page: Page) {
	await expect(practiceQuestionHeading(page).or(practiceEmptyState(page))).toBeVisible({
		timeout: 10000
	});
}

/** Practice page shows Convex questions or a documented empty state when Convex is not configured. */
export async function hasPracticeQuestions(page: Page) {
	await waitForPracticeContent(page);
	if (await practiceEmptyState(page).isVisible().catch(() => false)) return false;
	return practiceQuestionHeading(page).isVisible().catch(() => false);
}

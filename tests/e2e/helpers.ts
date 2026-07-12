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
	return page.getByTestId('practice-question').locator('h2').first();
}

/** Practice page empty state when Convex is missing or the track has no seeded questions. */
export function practiceEmptyState(page: Page) {
	return page.getByText(/No practice questions|Practice questions require Convex/i);
}

/** Wait until the practice page shows questions or a documented empty state. */
export async function waitForPracticeContent(page: Page) {
	await expect(
		page.getByTestId('practice-start').or(practiceQuestionHeading(page)).or(practiceEmptyState(page))
	).toBeVisible({
		timeout: 10000
	});
}

/** Start the exam from the intro screen if present. */
export async function startPracticeExam(page: Page) {
	const startBtn = page.getByTestId('practice-start');
	if (await startBtn.isVisible().catch(() => false)) {
		await startBtn.click();
		await expect(page.getByTestId('practice-question')).toBeVisible();
	}
}

/** Practice page shows Convex questions or a documented empty state when Convex is not configured. */
export async function hasPracticeQuestions(page: Page) {
	await waitForPracticeContent(page);
	if (await practiceEmptyState(page).isVisible().catch(() => false)) return false;
	return (
		(await page.getByTestId('practice-start').isVisible().catch(() => false)) ||
		(await practiceQuestionHeading(page).isVisible().catch(() => false))
	);
}

/** Answer every question by selecting the first choice and advancing with Next. */
export async function answerAllPracticeQuestions(page: Page) {
	await startPracticeExam(page);
	const totalText = await page.getByTestId('practice-position').textContent();
	const match = totalText?.match(/of (\d+)/);
	const total = match ? Number(match[1]) : 1;

	for (let i = 0; i < total; i++) {
		const radio = page.getByTestId('practice-question').locator('input[type="radio"]').first();
		const checkbox = page.getByTestId('practice-question').locator('input[type="checkbox"]').first();
		if (await radio.isVisible().catch(() => false)) {
			await radio.click();
		} else if (await checkbox.isVisible().catch(() => false)) {
			await checkbox.click();
		}

		if (i < total - 1) {
			await page.getByTestId('practice-next').click();
		}
	}
}

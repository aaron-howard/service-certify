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

export async function gotoPractice(page: Page, slug: string, mode: 'sample' | 'full' = 'sample') {
	const query = mode === 'full' ? '?mode=full' : '';
	await page.goto(`/exams/${slug}/practice${query}`);
	await waitForPracticeContent(page);
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

/** Parse "Question X of Y" from the practice header. */
export async function getPracticeQuestionTotal(page: Page): Promise<number> {
	const totalText = await page.getByTestId('practice-position').textContent();
	const match = totalText?.match(/of (\d+)/);
	return match ? Number(match[1]) : 1;
}

/** Parse current 1-based question number from the practice header. */
export async function getPracticeQuestionNumber(page: Page): Promise<number> {
	const totalText = await page.getByTestId('practice-position').textContent();
	const match = totalText?.match(/Question (\d+)/);
	return match ? Number(match[1]) : 1;
}

/** Answer the visible question (radio, checkbox, or first match pair). */
export async function answerCurrentPracticeQuestion(page: Page) {
	const card = page.getByTestId('practice-question');
	const radio = card.locator('input[type="radio"]').first();
	const checkbox = card.locator('input[type="checkbox"]').first();
	const matchLeft = card.getByRole('button', { name: /./ }).first();

	if (await radio.isVisible().catch(() => false)) {
		await radio.click();
		return;
	}
	if (await checkbox.isVisible().catch(() => false)) {
		await checkbox.click();
		return;
	}
	// Match: tap first left item, then first right target.
	const leftButtons = card.locator('ul').first().getByRole('button');
	const rightButtons = card.locator('ul').nth(1).getByRole('button');
	if ((await leftButtons.count()) > 0 && (await rightButtons.count()) > 0) {
		await leftButtons.first().click();
		await rightButtons.first().click();
	}
}

/** Open the question palette via footer button. */
export async function openPracticePalette(page: Page) {
	await page.getByTestId('practice-palette-toggle').click();
	await expect(page.getByTestId('practice-palette')).toBeVisible();
}

/** Submit through the confirmation modal. */
export async function confirmPracticeSubmit(page: Page) {
	await page.getByTestId('practice-submit').click();
	await expect(page.getByTestId('practice-submit-confirm')).toBeVisible();
	await page.getByTestId('practice-submit-confirm').click();
}

/** Force timer expiry via localStorage draft (requires an active live session draft). */
export async function expirePracticeTimerDraft(
	page: Page,
	trackCode: string,
	mode: 'sample' | 'full' = 'sample'
) {
	const key = `service-certify:practice:${trackCode}:${mode}`;
	await page.evaluate((storageKey) => {
		const raw = localStorage.getItem(storageKey);
		if (!raw) throw new Error('No practice draft to expire');
		const draft = JSON.parse(raw) as { remaining: number; phase: string };
		draft.remaining = 0;
		draft.phase = 'live';
		localStorage.setItem(storageKey, JSON.stringify(draft));
	}, key);
	await page.reload();
	await expect(page.getByTestId('practice-question').or(page.getByText(/Your sample score/i))).toBeVisible({
		timeout: 15000
	});
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
	const total = await getPracticeQuestionTotal(page);

	for (let i = 0; i < total; i++) {
		await answerCurrentPracticeQuestion(page);

		if (i < total - 1) {
			await page.getByTestId('practice-next').click();
		}
	}
}

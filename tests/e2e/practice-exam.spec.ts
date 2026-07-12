import { test, expect } from '@playwright/test';
import {
	answerAllPracticeQuestions,
	answerCurrentPracticeQuestion,
	confirmPracticeSubmit,
	expirePracticeTimerDraft,
	getPracticeQuestionNumber,
	gotoPractice,
	hasPracticeQuestions,
	openPracticePalette,
	practiceEmptyState,
	startPracticeExam
} from './helpers';

/**
 * Expanded practice exam flows: navigation, palette, keyboard, review,
 * persistence, timer auto-submit, and multi/match item types.
 * Skips gracefully when Convex is not configured or the bank is empty.
 */

test.describe('Practice exam (one-at-a-time)', () => {
	test('navigates with Next and question palette', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		expect(await getPracticeQuestionNumber(page)).toBe(1);

		await page.getByTestId('practice-next').click();
		expect(await getPracticeQuestionNumber(page)).toBe(2);

		await openPracticePalette(page);
		await page.getByTestId('practice-palette').getByRole('button', { name: '1' }).click();
		expect(await getPracticeQuestionNumber(page)).toBe(1);
	});

	test('syncs ?q= URL with current question', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		await page.getByTestId('practice-next').click();
		await expect(page).toHaveURL(/[?&]q=2/);

		await page.goto(page.url().replace(/q=\d+/, 'q=1'));
		await expect(page.getByTestId('practice-position')).toContainText('Question 1 of');
	});

	test('shows submit modal for unanswered questions', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		await page.getByTestId('practice-submit').click();
		await expect(page.getByRole('dialog', { name: /Submit exam/i })).toBeVisible();
		await expect(page.getByText(/unanswered question/i)).toBeVisible();
		await page.getByRole('button', { name: 'Keep working' }).click();
		await expect(page.getByRole('dialog', { name: /Submit exam/i })).not.toBeVisible();
	});

	test('enters review mode after submit', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await answerAllPracticeQuestions(page);
		await confirmPracticeSubmit(page);
		await expect(page.getByText(/Your sample score/i)).toBeVisible({ timeout: 15000 });

		await page.getByTestId('practice-review').click();
		await expect(page.getByTestId('practice-question')).toBeVisible();
		await expect(page.getByText('Explanation')).toBeVisible();
		await page.getByTestId('practice-next').click();
		expect(await getPracticeQuestionNumber(page)).toBe(2);
	});

	test('supports keyboard navigation shortcuts', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		await page.keyboard.press('ArrowRight');
		expect(await getPracticeQuestionNumber(page)).toBe(2);

		await page.keyboard.press('ArrowLeft');
		expect(await getPracticeQuestionNumber(page)).toBe(1);

		await page.keyboard.press('f');
		await expect(page.getByTestId('practice-flag')).toContainText('Flagged');

		await page.keyboard.press('p');
		await expect(page.getByTestId('practice-palette')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('practice-palette')).not.toBeVisible();
	});

	test('restores live session from localStorage after refresh', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		await answerCurrentPracticeQuestion(page);
		await page.getByTestId('practice-next').click();
		await page.waitForTimeout(500);

		await page.reload();
		await expect(page.getByTestId('practice-start')).not.toBeVisible();
		await expect(page.getByTestId('practice-position')).toContainText('Question 2 of');
	});

	test('auto-submits when timer reaches zero', async ({ page }) => {
		await gotoPractice(page, 'csa');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		await page.waitForTimeout(500);
		await expirePracticeTimerDraft(page, 'CSA', 'sample');
		await expect(page.getByText(/Your sample score/i)).toBeVisible({ timeout: 20000 });
	});

	test('answers multi-select sample question on CAD', async ({ page }) => {
		await gotoPractice(page, 'cad');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		const checkbox = page.getByTestId('practice-question').locator('input[type="checkbox"]').first();
		if (!(await checkbox.isVisible().catch(() => false))) {
			test.skip(true, 'CAD sample did not include a multi-select question');
			return;
		}

		await checkbox.click();
		await expect(checkbox).toBeChecked();
		await expect(page.getByText(/Select all that apply/i)).toBeVisible();
	});

	test('answers match sample question on CPOP', async ({ page }) => {
		await gotoPractice(page, 'cpop');
		if (!(await hasPracticeQuestions(page))) {
			await expect(practiceEmptyState(page)).toBeVisible();
			return;
		}

		await startPracticeExam(page);
		const card = page.getByTestId('practice-question');
		const hasMatch = await card.getByText(/Match each item/i).isVisible().catch(() => false);
		if (!hasMatch) {
			test.skip(true, 'CPOP sample did not include a match question');
			return;
		}

		await answerCurrentPracticeQuestion(page);
		await expect(card.getByText(/→/)).toBeVisible();
	});
});

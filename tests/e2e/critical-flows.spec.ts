import { test, expect } from '@playwright/test';
import {
	examCardLinks,
	gotoFirstExam,
	gotoFirstPractice,
	hasPracticeQuestions
} from './helpers';

/**
 * Critical user flows for Service Certify.
 * Tests the happy path from landing → exam browse → practice session.
 */

test.describe('Critical User Flows', () => {
	test('should load landing page', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
	});

	test('should navigate to exams catalog', async ({ page }) => {
		await page.goto('/');

		const examsLink = page.locator('a[href="/exams"], a[href*="/exams"]').first();
		await examsLink.click();

		await expect(page).toHaveURL('/exams');
		await page.waitForLoadState('domcontentloaded');
		await expect(examCardLinks(page).first()).toBeVisible({ timeout: 10000 });
	});

	test('should view exam details', async ({ page }) => {
		await gotoFirstExam(page);

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		const practiceBtn = page.locator('a:has-text("Practice"), button:has-text("Practice")');
		await expect(practiceBtn.first()).toBeVisible();
	});

	test('should start practice session', async ({ page }) => {
		await gotoFirstPractice(page);

		if (await hasPracticeQuestions(page)) {
			await expect(page.locator('article h2').first()).toBeVisible();
		} else {
			await expect(page.getByText(/No practice questions/i)).toBeVisible();
		}
	});

	test('should answer questions in practice session', async ({ page }) => {
		await gotoFirstPractice(page);

		if (!(await hasPracticeQuestions(page))) {
			await expect(page.getByText(/No practice questions/i)).toBeVisible();
			return;
		}

		const firstChoice = page.locator('article input[type="radio"]').first();
		await firstChoice.click();
		await expect(firstChoice).toBeChecked();
	});

	test('should submit practice session and view results', async ({ page }) => {
		await gotoFirstPractice(page);

		if (!(await hasPracticeQuestions(page))) {
			await expect(page.getByText(/No practice questions/i)).toBeVisible();
			return;
		}

		const radios = page.locator('article input[type="radio"]');
		const articles = page.locator('article');
		const articleCount = await articles.count();

		for (let i = 0; i < articleCount; i++) {
			const radio = articles.nth(i).locator('input[type="radio"]').first();
			if (await radio.isVisible()) {
				await radio.click();
			}
		}

		const submitBtn = page.locator('button:has-text("Submit")');
		if (await submitBtn.isVisible()) {
			await submitBtn.click();
			await expect(page.getByText(/Your sample score/i)).toBeVisible({ timeout: 10000 });
		} else {
			expect(await radios.count()).toBeGreaterThan(0);
		}
	});

	test('should have accessible navigation', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();

		const skipLink = page.locator('a:has-text("Skip")');
		const mainHeading = page.getByRole('heading', { level: 1 });

		const hasSkipLink = await skipLink.isVisible().catch(() => false);
		const hasMainHeading = await mainHeading.isVisible().catch(() => false);

		expect(hasSkipLink || hasMainHeading).toBeTruthy();
	});

	test('should handle errors gracefully', async ({ page }) => {
		await page.goto('/exams/nonexistent');

		const heading = page.getByRole('heading').first();
		await expect(heading).toBeVisible();
	});

	test('should be mobile responsive', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });

		await page.goto('/exams');
		await page.waitForLoadState('domcontentloaded');

		await expect(examCardLinks(page).first()).toBeVisible({ timeout: 10000 });

		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = 375;
		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
	});
});

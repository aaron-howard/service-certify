import { test, expect } from '@playwright/test';

/**
 * Critical user flows for Service Certify.
 * Tests the happy path from landing → exam browse → practice session.
 */

test.describe('Critical User Flows', () => {
	test('should load landing page', async ({ page }) => {
		await page.goto('/');

		// Check page title/heading
		const heading = page.locator('h1, h2');
		await expect(heading).toBeVisible();

		// Check navigation is present
		const nav = page.locator('header nav, header');
		await expect(nav).toBeVisible();
	});

	test('should navigate to exams catalog', async ({ page }) => {
		await page.goto('/');

		// Click on exams link/button
		const examsLink = page.locator('a[href*="/exams"], button:has-text("Exam")');
		await examsLink.first().click();

		// Should be on exams page
		await expect(page).toHaveURL('/exams');

		// Exam list should be visible
		await page.waitForLoadState('networkidle');
		const examItems = page.locator('[data-testid="exam-item"], li, .exam-card');
		await expect(examItems.first()).toBeVisible({ timeout: 5000 });
	});

	test('should view exam details', async ({ page }) => {
		await page.goto('/exams');

		// Wait for exam list to load
		await page.waitForLoadState('networkidle');

		// Click on first exam
		const firstExam = page.locator('a[href*="/exams/"]').first();
		await firstExam.click();

		// Should be on exam detail page
		await expect(page).toHaveURL(/\/exams\/[^/]+$/);

		// Exam details should be visible
		const examTitle = page.locator('h1, h2');
		await expect(examTitle).toBeVisible();

		// Practice button should be visible
		const practiceBtn = page.locator('button:has-text("Practice"), a:has-text("Practice")');
		await expect(practiceBtn).toBeVisible();
	});

	test('should start practice session', async ({ page }) => {
		await page.goto('/exams');

		// Navigate to first exam
		await page.waitForLoadState('networkidle');
		const firstExam = page.locator('a[href*="/exams/"]').first();
		await firstExam.click();

		// Click practice button
		const practiceBtn = page.locator('button:has-text("Practice"), a:has-text("Practice")');
		await practiceBtn.click();

		// Should be on practice page
		await expect(page).toHaveURL(/\/exams\/[^/]+\/practice/);

		// Questions should load
		await page.waitForLoadState('networkidle');
		const questions = page.locator('[data-testid="question"], .question');
		await expect(questions.first()).toBeVisible({ timeout: 5000 });
	});

	test('should answer questions in practice session', async ({ page }) => {
		// Navigate to practice session
		await page.goto('/exams');
		await page.waitForLoadState('networkidle');

		const firstExam = page.locator('a[href*="/exams/"]').first();
		await firstExam.click();

		const practiceBtn = page.locator('button:has-text("Practice"), a:has-text("Practice")');
		await practiceBtn.click();

		await page.waitForLoadState('networkidle');

		// Answer first question
		const choices = page.locator('[data-testid="choice"], label:has(input[type="radio"]), .choice');
		const firstChoice = choices.first();

		if (await firstChoice.isVisible()) {
			await firstChoice.click();
			// Verify selection
			await expect(firstChoice.locator('input')).toBeChecked({ timeout: 2000 });
		}
	});

	test('should submit practice session and view results', async ({ page }) => {
		// Navigate to practice session
		await page.goto('/exams');
		await page.waitForLoadState('networkidle');

		const firstExam = page.locator('a[href*="/exams/"]').first();
		await firstExam.click();

		const practiceBtn = page.locator('button:has-text("Practice"), a:has-text("Practice")');
		await practiceBtn.click();

		await page.waitForLoadState('networkidle');

		// Select some answers (click first choice for each question)
		const choices = page.locator('[data-testid="choice"], label:has(input[type="radio"]), .choice');
		const count = await choices.count();

		// Answer first 3 questions (or all if fewer)
		for (let i = 0; i < Math.min(count, 3); i++) {
			const choice = choices.nth(i);
			if (await choice.isVisible()) {
				await choice.click();
				await page.waitForTimeout(100);
			}
		}

		// Find and click submit button
		const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Grade"), button:has-text("Check")');
		if (await submitBtn.isVisible()) {
			await submitBtn.click();

			// Results should be shown
			await page.waitForLoadState('networkidle');
			const results = page.locator('[data-testid="results"], .results, .score');
			await expect(results).toBeVisible({ timeout: 5000 });
		}
	});

	test('should have accessible navigation', async ({ page }) => {
		await page.goto('/');

		// Navigation should be keyboard accessible
		const nav = page.locator('nav, header');
		await expect(nav).toBeVisible();

		// Should have skip links or proper heading structure
		const skipLink = page.locator('a:has-text("Skip")');
		const mainHeading = page.locator('h1');

		const hasSkipLink = await skipLink.isVisible().catch(() => false);
		const hasMainHeading = await mainHeading.isVisible().catch(() => false);

		expect(hasSkipLink || hasMainHeading).toBeTruthy();
	});

	test('should handle errors gracefully', async ({ page }) => {
		// Navigate to non-existent exam
		await page.goto('/exams/nonexistent');

		// Should not crash, might show 404 or redirect
		// Page should remain interactive
		const heading = page.locator('h1, h2');
		await expect(heading).toBeVisible();
	});

	test('should be mobile responsive', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 812 });

		await page.goto('/exams');
		await page.waitForLoadState('networkidle');

		// Page should be readable on mobile
		const examItems = page.locator('[data-testid="exam-item"], li, .exam-card');
		await expect(examItems.first()).toBeVisible({ timeout: 5000 });

		// Should not have horizontal scroll
		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = 375;
		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Small tolerance
	});
});

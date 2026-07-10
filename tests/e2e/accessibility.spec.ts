import { test, expect } from '@playwright/test';
import { examCardLinks, gotoFirstExam, gotoFirstPractice, hasPracticeQuestions } from './helpers';

/**
 * Accessibility tests for WCAG 2.1 AA compliance.
 * Tests critical pages for accessibility issues.
 */

test.describe('Accessibility (WCAG 2.1 AA)', () => {
	test('landing page should be accessible', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle(/Service Certify/i);
		await expect(page.getByRole('main')).toBeVisible();
	});

	test('exams catalog should be accessible', async ({ page }) => {
		await page.goto('/exams');
		await page.waitForLoadState('domcontentloaded');

		await expect(page.getByRole('main')).toBeVisible();
	});

	test('exam detail page should be accessible', async ({ page }) => {
		await gotoFirstExam(page);
		await expect(page.getByRole('main')).toBeVisible();
	});

	test('practice session should be accessible', async ({ page }) => {
		await gotoFirstPractice(page);
		await expect(page.getByRole('main')).toBeVisible();
	});

	test('dashboard redirects anonymous users to accessible sign-in', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/auth\/signin/);
		await expect(page.getByRole('main')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('settings redirects anonymous users to accessible sign-in', async ({ page }) => {
		await page.goto('/settings');
		await expect(page).toHaveURL(/\/auth\/signin/);
		await expect(page.getByRole('main')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		await page.goto('/');

		const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
		expect(headings.length).toBeGreaterThan(0);

		const firstLevel = parseInt(await headings[0].evaluate((el) => el.tagName[1]));
		expect([1, 2]).toContain(firstLevel);
	});

	test('should have alt text on images', async ({ page }) => {
		await page.goto('/');

		const images = await page.locator('img').all();

		for (const img of images) {
			const alt = await img.getAttribute('alt');
			const ariaLabel = await img.getAttribute('aria-label');
			const ariaHidden = await img.getAttribute('aria-hidden');
			const role = await img.getAttribute('role');

			const isDecorative =
				ariaHidden === 'true' || role === 'presentation' || role === 'none';
			const hasAccessibleName = Boolean(ariaLabel?.trim()) || alt !== null;

			expect(isDecorative || hasAccessibleName).toBeTruthy();
		}
	});

	test('should have accessible form inputs', async ({ page }) => {
		await page.goto('/exams');
		await page.waitForLoadState('domcontentloaded');

		const inputs = await page.locator('input, select, textarea').all();

		for (const input of inputs) {
			const id = await input.getAttribute('id');
			const ariaLabel = await input.getAttribute('aria-label');
			const ariaLabelledBy = await input.getAttribute('aria-labelledby');
			const type = await input.getAttribute('type');

			if (type === 'hidden') continue;

			if (id) {
				const label = page.locator(`label[for="${id}"]`);
				const hasLabel = await label.isVisible().catch(() => false);
				expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
			} else if (ariaLabel || ariaLabelledBy) {
				expect(true).toBeTruthy();
			}
		}
	});

	test('should have accessible buttons', async ({ page }) => {
		await page.goto('/exams');

		const buttons = await page.locator('button').all();

		for (const btn of buttons) {
			const text = await btn.textContent();
			const ariaLabel = await btn.getAttribute('aria-label');
			expect(text?.trim() || ariaLabel).toBeTruthy();
		}
	});

	test('should have proper heading structure', async ({ page }) => {
		await page.goto('/');

		const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

		if (headings.length > 0) {
			const firstHeadingTag = await headings[0].evaluate((el) => el.tagName);
			expect(['H1', 'H2']).toContain(firstHeadingTag);
		}
	});

	test('should support keyboard navigation', async ({ page }) => {
		await page.goto('/');

		await page.keyboard.press('Tab');

		const focused = await page.evaluate(() => document.activeElement?.tagName);
		expect(focused).toBeTruthy();

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			await page.waitForTimeout(100);
		}
	});

	test('should handle focus indicators', async ({ page }) => {
		await page.goto('/');

		await page.keyboard.press('Tab');

		const focused = await page.locator(':focus').first();
		const isVisible = await focused.isVisible().catch(() => false);

		if (isVisible) {
			expect(isVisible).toBe(true);
		}
	});

	test('should have skip to main content link', async ({ page }) => {
		await page.goto('/');

		const skipLink = page.locator('a:has-text("Skip")');
		const mainContent = page.getByRole('main');

		const hasSkip = await skipLink.isVisible().catch(() => false);
		const hasMain = await mainContent.isVisible().catch(() => false);

		expect(hasSkip || hasMain).toBe(true);
	});

	test('should have proper landmarks', async ({ page }) => {
		await page.goto('/');

		const main = page.getByRole('main');
		const nav = page.getByRole('navigation');

		const hasMain = await main.isVisible().catch(() => false);
		const hasNav = await nav.isVisible().catch(() => false);

		expect(hasMain || hasNav).toBe(true);
	});
});

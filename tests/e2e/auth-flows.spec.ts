import { test, expect } from '@playwright/test';
import { gotoFirstExam, gotoFirstPractice, hasPracticeQuestions, practiceEmptyState } from './helpers';

/**
 * Auth-related flows that do not require live WorkOS credentials.
 * Full OAuth round-trips stay manual / staging-only.
 */
test.describe('Auth flows', () => {
	test('sign-in page shows OAuth providers', async ({ page }) => {
		await page.goto('/auth/signin');

		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
		await expect(page.getByTestId('signin-provider-google')).toBeVisible();
		await expect(page.getByTestId('signin-provider-microsoft')).toBeVisible();
		await expect(page.getByTestId('signin-provider-github')).toBeVisible();
	});

	test('sign-in provider links include redirect when present', async ({ page }) => {
		const redirect = '/exams/csa/practice?mode=full';
		await page.goto(`/auth/signin?redirect=${encodeURIComponent(redirect)}`);

		const google = page.getByTestId('signin-provider-google');
		await expect(google).toHaveAttribute(
			'href',
			`/auth/login?provider=google&redirect=${encodeURIComponent(redirect)}`
		);
	});

	test('anonymous full mock redirects to sign-in with redirect param', async ({ page }) => {
		await page.goto('/exams/csa/practice?mode=full');

		await expect(page).toHaveURL(/\/auth\/signin/);
		const url = new URL(page.url());
		expect(url.searchParams.get('redirect')).toBe('/exams/csa/practice?mode=full');
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
	});

	test('exam detail hides full mock CTA for anonymous users', async ({ page }) => {
		await gotoFirstExam(page);

		await expect(page.getByTestId('try-sample-practice')).toBeVisible();
		await expect(page.getByTestId('start-full-mock')).toHaveCount(0);
	});

	test('sample practice remains available without sign-in', async ({ page }) => {
		await gotoFirstPractice(page);

		if (await hasPracticeQuestions(page)) {
			await expect(page.locator('article h2').first()).toBeVisible();
		} else {
			await expect(practiceEmptyState(page)).toBeVisible();
		}
	});

	test('dashboard redirects anonymous users to sign-in', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/auth\/signin/);
		const url = new URL(page.url());
		expect(url.searchParams.get('redirect')).toBe('/dashboard');
	});

	test('settings redirects anonymous users to sign-in', async ({ page }) => {
		await page.goto('/settings');
		await expect(page).toHaveURL(/\/auth\/signin/);
		const url = new URL(page.url());
		expect(url.searchParams.get('redirect')).toBe('/settings');
	});
});

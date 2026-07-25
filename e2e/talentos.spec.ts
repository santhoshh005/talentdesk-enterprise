import { test, expect } from '@playwright/test';

test.describe('TalentOS Enterprise Platform E2E Flows', () => {
  test('User can land on login and navigate to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page).toHaveTitle(/Sign in — TalentOS/);

    await page.fill('#email', 'admin@talentos.ai');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Candidates list displays candidate metrics', async ({ page }) => {
    await page.goto('http://localhost:3000/candidates');
    await expect(page.locator('text=Candidates')).toBeVisible();
  });
});

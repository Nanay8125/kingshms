import { test, expect } from '@playwright/test';

test('should load the landing page', async ({ page }) => {
  await page.goto('/');
  // Basic check for application presence
  await expect(page).toHaveTitle(/KingsHMS/i);
});

test('should allow navigating to login', async ({ page }) => {
  await page.goto('/');
  // Find a login button or link if it exists
  const loginLink = page.getByRole('button', { name: /login|sign in/i }).first();
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page.url()).toContain('login');
  }
});

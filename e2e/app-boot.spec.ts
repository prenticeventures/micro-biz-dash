import { expect, test } from '@playwright/test';

test('normal app boot reaches the main menu without hanging on loading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /play level 1 free/i })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText(/loading/i)).toHaveCount(0);
  await expect(page.getByText(/online services took too long|temporarily unavailable|continuing without account save/i)).toHaveCount(0);
});

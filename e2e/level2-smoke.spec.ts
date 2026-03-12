import { expect, test } from '@playwright/test';

function getDebugX(debugText: string | null): number {
  const match = /X:(-?\d+)/.exec(debugText ?? '');
  if (!match) {
    throw new Error(`Could not parse debug X from "${debugText}"`);
  }

  return Number(match[1]);
}

test('guest flow reaches level 2 without auth gating and movement still works', async ({ page }) => {
  await page.goto('/?e2e');

  await expect(page.getByText(/full game available without an account/i)).toBeVisible();
  await page.getByRole('button', { name: /play level 1 free/i }).click();
  await page.getByRole('button', { name: 'E2E COMPLETE LEVEL' }).click();
  await page.getByRole('button', { name: /next level/i }).click();

  const debugState = page.getByTestId('e2e-debug-state');
  await expect(debugState).toContainText('STATUS:PLAYING');
  await expect(debugState).toContainText('LVL:2');

  const startX = getDebugX(await debugState.textContent());

  await page.getByRole('button', { name: 'E2E STEP RIGHT' }).click();
  await page.waitForTimeout(350);

  const endX = getDebugX(await debugState.textContent());
  expect(endX).toBeGreaterThan(startX);
});

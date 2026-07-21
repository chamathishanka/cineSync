import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../data/config';

// TEMPORARY locator-discovery scratch spec. Delete once page objects are built.
test('explore ticket rate cards', async ({ page }) => {
  test.setTimeout(240_000);

  const login = new LoginPage(page);
  await login.goto('/');
  await login.login(config.accessCode, config.licenseCode, config.username, config.password);
  await login.usernameInput.waitFor({ state: 'hidden' });

  await page.getByRole('button', { name: 'Cashier' }).click();
  await page.locator('.movieRowWrap').first().waitFor();
  await page.locator('.movieEventCardWrap:not(.hide)').first().click();

  // Rates render asynchronously into this row - wait for a child, not the row itself.
  const rateCards = page.locator('.tarifCardsRow > *');
  await rateCards.first().waitFor({ timeout: 30_000 });

  console.log('RATE CARD COUNT =', await rateCards.count());
  console.log('=== FIRST RATE CARD ===');
  console.log(await rateCards.first().innerHTML());
  console.log('=== ALL RATE LABELS ===');
  console.log(JSON.stringify(await rateCards.allInnerTexts(), null, 2));
});

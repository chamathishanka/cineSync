import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CashierPage } from '../pages/CashierPage';
import { TicketsPage } from '../pages/TicketsPage';
import { config } from '../data/config';

test.describe('CINEsync ticket purchase - Cash payment', () => {
  test('logs in, opens Cashier, selects a movie and a ticket type', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/');

    await loginPage.login(config.accessCode, config.licenseCode, config.username, config.password);

    await expect(loginPage.usernameInput).toBeHidden();

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.cashierCard).toBeVisible();
    await expect(dashboardPage.customerDisplayCard).toBeVisible();
    await expect(dashboardPage.logoutCard).toBeVisible();

    await dashboardPage.openCashier();

    const cashierPage = new CashierPage(page);
    await cashierPage.waitForLoad();
    await expect(cashierPage.ticketingTab).toBeVisible();

    await cashierPage.goToTickets();
    await expect(cashierPage.ticketingTab).toHaveAttribute('aria-current', 'page');

    const ticketsPage = new TicketsPage(page);
    await ticketsPage.waitForLoad();
    await expect(ticketsPage.movieRows.first()).toBeVisible();

    await ticketsPage.selectAvailableMovie();
    await expect(ticketsPage.rateCards.first()).toBeVisible();

    // Step 5 - select a ticket type. The cart starts empty and should reflect the choice.
    await expect(ticketsPage.emptyCartMessage).toBeVisible();

    const ticketType = await ticketsPage.selectFirstAvailableTicketType();

    await expect(ticketsPage.emptyCartMessage).toBeHidden();
    await expect(ticketsPage.cartBody.getByText(ticketType)).toBeVisible();
    await expect(ticketsPage.continueButton).toBeEnabled();
    await expect(ticketsPage.cartTotal).not.toHaveText('$0.00');
  });
});

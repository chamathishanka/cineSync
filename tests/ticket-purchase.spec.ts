import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CashierPage } from '../pages/CashierPage';
import { TicketsPage } from '../pages/TicketsPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { config } from '../data/config';

test.describe('CINEsync ticket purchase - Cash payment', () => {
  test('completes a cinema ticket purchase paid by cash, end to end', async ({ page }) => {
    // Step 1 - log in and reach the dashboard.
    const loginPage = new LoginPage(page);
    await loginPage.goto('/');
    await loginPage.login(config.accessCode, config.licenseCode, config.username, config.password);
    await expect(loginPage.usernameInput).toBeHidden();

    // Step 2 - all three modules are offered; open Cashier.
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.cashierCard).toBeVisible();
    // A shift prompt can overlay the dashboard and swallow the click - clear it if shown.
    // Reported so CI can show whether the prompt appeared and was handled.
    const shiftPrompts = await dashboardPage.clearShiftPrompts();
    console.log(`SHIFT_PROMPT: ${shiftPrompts.length ? shiftPrompts.join(' -> ') : 'none'}`);
    await expect(dashboardPage.customerDisplayCard).toBeVisible();
    await expect(dashboardPage.logoutCard).toBeVisible();

    await dashboardPage.openCashier();

    const cashierPage = new CashierPage(page);
    await cashierPage.waitForLoad();
    await expect(cashierPage.ticketingTab).toBeVisible();

    // Step 3 - navigate to Ticketing (already the default tab, so assert it is active).
    await cashierPage.goToTickets();
    await expect(cashierPage.ticketingTab).toHaveAttribute('aria-current', 'page');

    // Step 4 - select whichever movie is available; its rate cards should load.
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.waitForLoad();
    await expect(ticketsPage.movieRows.first()).toBeVisible();

    await ticketsPage.selectAvailableMovie();
    await expect(ticketsPage.rateCards.first()).toBeVisible();

    // Step 5 - select a ticket type; the cart goes from empty to holding that ticket.
    await expect(ticketsPage.emptyCartMessage).toBeVisible();

    const ticketType = await ticketsPage.selectFirstAvailableTicketType();

    await expect(ticketsPage.emptyCartMessage).toBeHidden();
    await expect(ticketsPage.cartBody.getByText(ticketType)).toBeVisible();
    await expect(ticketsPage.continueButton).toBeEnabled();
    await expect(ticketsPage.cartTotal).not.toHaveText('$0.00');

    // Step 6 - proceed to checkout and review the order summary.
    await ticketsPage.proceedToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.waitForLoad();
    await expect(page).toHaveURL(/\/cashier\/payment/);
    await expect(checkoutPage.paymentHeading).toBeVisible();
    await expect(checkoutPage.orderTotalLabel.first()).toBeVisible();
    // The ticket chosen in Step 5 is carried into the order summary.
    await expect(page.getByText(ticketType).first()).toBeVisible();
    await expect(checkoutPage.cashMethod).toBeVisible();

    // Step 7 - pay the exact amount in cash and complete the sale.
    await checkoutPage.disablePrinting();
    await checkoutPage.openCashPayment();
    await expect(checkoutPage.returnAmount).toHaveText(/Return \$0\.00/);
    await checkoutPage.confirmPayment();
    await checkoutPage.complete();

    // Transaction finished: the POS returns to the ticketing screen, ready for the next sale.
    await expect(page).toHaveURL(/\/cashier\/ticketing\/now/);
    await expect(ticketsPage.movieRows.first()).toBeVisible();
  });
});

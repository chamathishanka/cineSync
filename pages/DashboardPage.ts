import { Page, errors } from '@playwright/test';
import { BasePage } from './BasePage';

/** Opening float used when the POS asks us to start a fresh shift. */
const OPENING_FLOAT = '1000';

export class DashboardPage extends BasePage {
  readonly cashierCard = this.page.getByRole('button', { name: 'Cashier' });
  readonly customerDisplayCard = this.page.getByRole('button', { name: 'Customer Display' });
  readonly logoutCard = this.page.getByRole('button', { name: 'Logout' });

  readonly endShiftDialog = this.page.getByText('End Your Shift');
  readonly startShiftDialog = this.page.getByText('Start Your New Shift');
  readonly shiftAmountInput = this.page.locator('#numberValue');
  readonly shiftConfirmButton = this.page.getByRole('button', { name: 'Confirm' });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Clears whichever POS shift prompt is blocking the dashboard, if either is showing.
   *
   * The shared QA environment intermittently asks the cashier to close the open shift
   * ("End Your Shift", amount pre-filled to the expected drawer total) and/or to open a
   * new one ("Start Your New Shift", amount empty). They overlay the module cards - which
   * stay visible behind them - so an unhandled prompt only surfaces as a swallowed click
   * further down the flow.
   *
   * Environment housekeeping, not coverage: the Shifts module is out of scope, so nothing
   * here is asserted and both prompts are optional.
   */
  async clearShiftPrompts() {
    if (await this.endShiftDialog.isVisible()) {
      // The amount pre-fills with the expected drawer total, leaving Difference $0.00.
      await this.shiftConfirmButton.click();
      await this.endShiftDialog.waitFor({ state: 'hidden' });

      // Ending a shift normally chains into starting the next one. Wait for that, but
      // tolerate it not happening - only a timeout is acceptable here, so a broken
      // locator or a strict-mode clash still surfaces instead of being swallowed.
      await this.startShiftDialog
        .waitFor({ state: 'visible', timeout: 5_000 })
        .catch((error) => {
          if (!(error instanceof errors.TimeoutError)) throw error;
        });
    }

    if (await this.startShiftDialog.isVisible()) {
      // This one starts empty, so the opening float has to be entered.
      await this.shiftAmountInput.fill(OPENING_FLOAT);
      await this.shiftConfirmButton.click();
      await this.startShiftDialog.waitFor({ state: 'hidden' });
    }
  }

  async openCashier() {
    await this.cashierCard.click();
  }
}

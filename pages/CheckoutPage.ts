import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** The checkout / payment screen (`/cashier/payment`). */
export class CheckoutPage extends BasePage {
  readonly paymentHeading = this.page.getByText('Payment Amount');
  // "Cash" is a substring of the card's accessible name ("Cash Cash").
  readonly cashMethod = this.page.getByRole('button', { name: 'Cash' });
  readonly orderTotalLabel = this.page.getByText('Total', { exact: true });
  // On by default; turning it off skips the receipt print, which would otherwise open a
  // native dialog and block a headed run.
  readonly printToggle = this.page.getByRole('checkbox', { name: 'Print' });

  // Cash modal.
  readonly cashReceivedPrompt = this.page.getByText('Enter cash amount received');
  readonly returnAmount = this.page.getByText(/Return \$/);
  readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });

  readonly completeButton = this.page.getByRole('button', { name: 'Complete' });

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad() {
    await this.cashMethod.waitFor();
  }

  async disablePrinting() {
    if (await this.printToggle.isChecked()) {
      await this.printToggle.uncheck();
    }
  }

  /** Opens the cash modal, where the amount pre-fills to the order total. */
  async openCashPayment() {
    await this.cashMethod.click();
    await this.cashReceivedPrompt.waitFor();
  }

  /** Confirms the pre-filled exact amount. */
  async confirmPayment() {
    await this.confirmButton.click();
  }

  async complete() {
    await this.completeButton.click();
  }
}

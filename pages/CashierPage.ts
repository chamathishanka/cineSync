import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CashierPage extends BasePage {
  // A real anchor with its own href, so role=link resolves it and aria-current can be
  // asserted off the same locator used to click it.
  readonly ticketingTab = this.page.getByRole('link', { name: 'Ticketing' });

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad() {
    await this.ticketingTab.waitFor();
  }

  async goToTickets() {
    await this.ticketingTab.click();
  }
}

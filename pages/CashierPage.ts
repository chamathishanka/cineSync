import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CashierPage extends BasePage {
  // Real anchor with its own href (unlike the dashboard nav cards, which all
  // shared a dummy href) - role="link" targets it directly, so aria-current
  // can be read off the same locator used to click it.
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

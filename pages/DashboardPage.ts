import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly cashierCard = this.page.getByRole('button', { name: 'Cashier' });
  readonly customerDisplayCard = this.page.getByRole('button', { name: 'Customer Display' });
  readonly logoutCard = this.page.getByRole('button', { name: 'Logout' });

  constructor(page: Page) {
    super(page);
  }

  async openCashier() {
    await this.cashierCard.click();
  }
}

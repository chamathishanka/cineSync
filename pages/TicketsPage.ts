import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicketsPage extends BasePage {
  readonly movieRows = this.page.locator('.movieRowWrap');
  // .hide marks unavailable (past/sold-out) showtimes - excluding it keeps
  // selection to a genuinely available movie regardless of the current lineup.
  readonly availableMovieCards = this.page.locator('.movieEventCardWrap:not(.hide)');
  readonly rateCards = this.page.locator('.tarifCardsRow > *');

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad() {
    await this.movieRows.first().waitFor();
  }

  async selectAvailableMovie() {
    await this.availableMovieCards.first().click();
  }
}

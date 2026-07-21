import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicketsPage extends BasePage {
  readonly movieRows = this.page.locator('.movieRowWrap');
  // .hide marks past/sold-out showtimes, keeping selection to an available one.
  readonly availableMovieCards = this.page.locator('.movieEventCardWrap:not(.hide)');
  readonly rateCards = this.page.locator('.tarifCardsRow > *');

  // Anchored on the visible heading so the "Combo tickets rates" section is excluded.
  readonly ticketRatesSection = this.page
    .locator('.tarifsSection')
    .filter({ has: this.page.getByText('Ticket rates', { exact: true }) });

  // The .seatTypeBadge filter is required: it skips the badge-less "Member Birthday
  // Validate" card, which opens a membership modal instead of adding a ticket.
  readonly seatTicketCards = this.ticketRatesSection
    .locator('button.ticketCard')
    .filter({ has: this.page.locator('.seatTypeBadge') });

  // Cart / order summary.
  readonly cartBody = this.page.locator('.basketBody');
  readonly emptyCartMessage = this.page.getByText('Cart is empty');
  readonly cartTotal = this.page.locator('.summaryContainer .total .contentValue');
  readonly continueButton = this.page.getByRole('button', { name: 'Continue' });

  constructor(page: Page) {
    super(page);
  }

  async waitForLoad() {
    await this.movieRows.first().waitFor();
  }

  async selectAvailableMovie() {
    await this.availableMovieCards.first().click();
  }

  /**
   * Selects the first available seat ticket (which adds it to the cart) and returns its
   * name, e.g. "Adult", so callers can assert on it without hardcoding a rate.
   */
  async selectFirstAvailableTicketType(): Promise<string> {
    const card = this.seatTicketCards.first();
    const typeName = (await card.locator('.titleTxt').innerText()).trim();
    await card.click();
    return typeName;
  }

  async proceedToCheckout() {
    await this.continueButton.click();
  }
}

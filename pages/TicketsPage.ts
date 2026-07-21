import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicketsPage extends BasePage {
  readonly movieRows = this.page.locator('.movieRowWrap');
  // .hide marks unavailable (past/sold-out) showtimes - excluding it keeps
  // selection to a genuinely available movie regardless of the current lineup.
  readonly availableMovieCards = this.page.locator('.movieEventCardWrap:not(.hide)');
  readonly rateCards = this.page.locator('.tarifCardsRow > *');

  // Rates are grouped under visible section headings ("Ticket rates" vs "Combo tickets
  // rates"). Anchor to the seat-ticket section by its heading text - a user-facing signal
  // that separates it from combos semantically, not by a structural quirk.
  readonly ticketRatesSection = this.page
    .locator('.tarifsSection')
    .filter({ has: this.page.getByText('Ticket rates', { exact: true }) });

  // Within that section, a real seat ticket is a .ticketCard carrying a .seatTypeBadge.
  // The badge filter still excludes the "Member Birthday Validate" card in the same
  // section (no badge -> clicking it opens a membership modal). Result: any genuinely
  // selectable seat ticket, regardless of the current rate lineup.
  readonly seatTicketCards = this.ticketRatesSection
    .locator('button.ticketCard')
    .filter({ has: this.page.locator('.seatTypeBadge') });

  // Cart / order summary (right panel).
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
   * Selects the first available seat ticket type and returns its name (e.g. "Adult"),
   * so the caller can assert dynamically without hardcoding a rate. Clicking a card
   * adds that ticket to the cart.
   */
  async selectFirstAvailableTicketType(): Promise<string> {
    const card = this.seatTicketCards.first();
    const typeName = (await card.locator('.titleTxt').innerText()).trim();
    await card.click();
    return typeName;
  }
}

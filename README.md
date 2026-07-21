# CINEsync POS — Ticket Purchase Automation

End-to-end UI automation of a standard cinema ticket purchase (Cash payment) on the CINEsync POS,
built with **Playwright** + **TypeScript** using the **Page Object Model**.

The suite drives the real flow: log in → open the Cashier module → navigate to Ticketing → select an
available movie → select a ticket type → checkout → pay by cash → complete the sale.

---

## Tech stack

- [Playwright Test](https://playwright.dev/) (`@playwright/test`)
- TypeScript
- `dotenv` for environment configuration

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install
```

Then create a `.env` file in the project root with the following variables (credentials are provided
in the assignment brief). `.env` is git-ignored.

```
BASE_URL=<CINEsync POS URL>
ACCESS_CODE=<access code>
LICENSE_CODE=<license code>
POS_USERNAME=<username>
POS_PASSWORD=<password>
```

## Running the tests

| Command | What it does |
|---|---|
| `npm test` | Run the suite headless (Chromium) |
| `npm run test:headed` | Run headed (visible browser) |
| `npm run test:debug` | Run with the Playwright Inspector |
| `npm run test:ui` | Open Playwright's interactive UI mode |
| `npm run report` | Open the last HTML report |

Run only the main scenario:

```bash
npx playwright test tests/ticket-purchase.spec.ts --project=chromium
```

## Project structure

```
.
├── data/config.ts           # Typed config sourced from environment variables
├── pages/                   # Page Object Model — one class per screen
│   ├── BasePage.ts          #   shared page handle + goto()
│   ├── LoginPage.ts         #   Step 1 — device codes + credentials
│   ├── DashboardPage.ts     #   Step 2 — Cashier / Customer Display / Logout
│   ├── CashierPage.ts       #   Step 3 — Cashier module shell + Ticketing nav
│   ├── TicketsPage.ts       #   Steps 4-5 — movie & ticket-type selection
│   └── CheckoutPage.ts      #   Steps 6-7 — checkout & cash payment
├── tests/
│   └── ticket-purchase.spec.ts   # The end-to-end purchase scenario
└── playwright.config.ts
```

## Design approach

- **Page Object Model** — each screen is a class extending `BasePage`, keeping locators and actions
  co-located and the spec readable as a sequence of business steps.
- **Reliable, maintainable locators** — role/name-based locators (`getByRole`) are preferred; stable
  semantic CSS classes are used only where the app exposes no accessible role, label, or test id.
- **Dynamic-data friendly** — no hardcoded movie or showtime. The suite selects the first *available*
  option at runtime (excluding sold-out/past entries), so it keeps working as the shared QA
  environment's lineup changes.
- **Proper synchronization** — uses Playwright's web-first, auto-retrying assertions and `waitFor`
  instead of fixed `waitForTimeout` sleeps.
- **Serial execution (`workers: 1`)** — the QA license is single-seat, so concurrent logins invalidate
  each other's session; the suite runs one worker to keep the session stable.

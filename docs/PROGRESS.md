# Progress log — CINEsync ticket purchase (Cash payment)

Tracks what's been built for the E2E scenario `tests/ticket-purchase.spec.ts`, and the reasoning
behind the decisions made along the way. Steps refer to the numbered steps in
`docs/Practical Test - Automation QA.pdf`.

## Status

| Step | Description | State |
|---|---|---|
| 1 | Login (access code, license code, credentials) | Done — `pages/LoginPage.ts` |
| 2 | Open Cashier module from dashboard | Done — `pages/DashboardPage.ts`, `pages/CashierPage.ts` |
| 3 | Navigate to Tickets (Ticketing tab) | Done — `pages/CashierPage.ts` |
| 4 | Select a movie | Done — `pages/TicketsPage.ts` |
| 5 | Select ticket type | Not started (rate cards already render — selection logic pending) |
| 6 | Add to sale, checkout, order summary | Not started |
| 7 | Cash payment | Not started |

## Decisions

**Page Object Model, one class per screen.** Each screen (`LoginPage`, `DashboardPage`,
`CashierPage`, ...) gets its own class extending `BasePage`, which just holds the `page` handle
and a shared `goto()`. Keeps locators and actions for a screen next to each other instead of
scattered across spec files.

**Locator strategy is picked per-screen, based on what the DOM actually offers — no fixed rule.**
- `LoginPage` uses `#id` locators for the code/credential inputs, because the DOM has no real
  `<label>` elements (just styled `div`s), so `getByLabel`/`getByRole` can't resolve them. IDs are
  the stable fallback there.
- `DashboardPage`'s three module cards (`Cashier` / `Customer Display` / `Logout`) all render as
  `<a href="/dashboard">` — the **same href on every card** — so they're SPA click handlers, not
  real navigation. CSS class names on them (`navCard`, `MuiButtonBase-root`, ...) are
  library-generated and not stable. The outer element does have `role="button"` and an accessible
  name equal to the label text, so `getByRole('button', { name: 'Cashier' })` is used instead —
  this was already proven to work in the scratch spec (`tests/_explore.spec.ts`) before being
  promoted into a real page object.
- `CashierPage.ticketingTab` uses `getByRole('link', { name: 'Ticketing' })` — unlike the
  dashboard cards, this sidebar anchor has its own real, distinct `href`, so its native
  `role="link"` is the right target (and lets us read `aria-current` off the same locator to assert
  the tab is active).
- `TicketsPage.movieRows` / `availableMovieCards` use the `.movieRowWrap` / `.movieEventCardWrap`
  CSS classes carried over from `_explore.spec.ts`, because the movie/showtime cards expose no
  accessible-role alternative.

**`tests/_explore.spec.ts` is a throwaway discovery tool, not a real test.** Its own header comment
says so. It's used to poke at a screen (click into it, dump `innerHTML`/`innerText`) *before*
writing the corresponding page object, so locator choices are based on real rendered DOM rather
than guesswork. It's left in the repo until every screen it covers has a real page object — at
that point it should be deleted per its own comment.

**`CashierPage` is the module *shell*; `TicketsPage` is the Ticketing *view*.** For Step 2,
`CashierPage` was filled in minimally (just enough to prove the module opened). In the Steps 3-4
phase it was refactored: the movie-list locators moved out to `TicketsPage`, and `CashierPage` now
only owns the sidebar (`ticketingTab` + `goToTickets()`). Rationale — the movie rows belong to the
Ticketing sub-view, not the Cashier shell, so splitting them keeps each page object scoped to one
screen.

**Step 3 clicks Ticketing even though it's already the default active tab.** When the Cashier
module opens, the Ticketing sidebar link is already `aria-current="page" class="link active"` (the
movie list is the landing view), confirmed via DevTools on the live app. We still call
`goToTickets()` explicitly so the automation *demonstrates* Step 3 rather than silently relying on
that default, then assert `aria-current="page"` — a real DOM-state check that holds whether or not
the click changed anything.

**Step 4 movie selection is dynamic, never hardcoded.** The PDF explicitly warns the shared QA
environment's movies/showtimes change over time. `selectAvailableMovie()` clicks
`.movieEventCardWrap:not(.hide)` (the `.hide` class marks past/sold-out showtimes) `.first()` — so
it picks whatever available showtime exists at run time rather than a named movie. Success is
asserted via the rate-cards row (`.tarifCardsRow`) rendering, which is the screen transition a
movie click triggers.

**Intermittent "calculator-like" screen after opening Cashier — known, unhandled risk.** The user
reported occasionally seeing a calculator/keypad-like screen right after clicking Cashier (possibly
an opening-cash/float prompt), but it appears randomly with no reproducible pattern and did not
recur during development. No handling was built because there's no reliable DOM sample to build it
from — guessing would add untested branch logic. If it starts failing runs, capture its
`error-context.md` accessibility snapshot and handle it in `CashierPage` then.

**Removed the TEMP diagnostic from `ticket-purchase.spec.ts` once it had served its purpose.** It
was a `console.log` dumping `.pageBody` HTML, added solely to find the dashboard nav-card
structure. Once `DashboardPage` was built from that output, the diagnostic was replaced with real
assertions (all three modules visible, then click into Cashier, then confirm the movie list
renders) rather than left in as dead debug code.

**`fixtures/pos.fixture.ts` and `pages/CheckoutPage.ts` are still empty stubs.** Deliberately not
built ahead of need — they belong to later steps (ticket type selection, checkout, cash payment)
that haven't been explored yet. Building them now would mean guessing at DOM that hasn't been seen.

**Tests always run with `workers: 1`, even locally (not just on CI).** The test license/session
is single-seat: logging in a second time (from a concurrent worker) silently kicks out the first
session server-side ("You have been logged out. Please login again."). This was hit in practice —
running `npm run test:headed` with the default (parallel) worker count logged in from both
`ticket-purchase.spec.ts` and `_explore.spec.ts` at once, and the second login invalidated the
first mid-test, producing a confusing `toBeVisible` timeout instead of an obvious cause. Since the
constraint is about the shared backend session, not CI, `playwright.config.ts` now hardcodes
`workers: 1` unconditionally rather than only serializing on CI.

## How to run

```
npm test                     # all specs, headless, chromium
npm run test:headed          # all specs, headed, chromium
npm run test:debug           # Playwright inspector
npx playwright test tests/ticket-purchase.spec.ts --project=chromium --headed   # just this spec, headed
npm run explore              # runs the scratch discovery spec, headed
npm run report                # open the last HTML report
```

Target environment and credentials come from `.env` (gitignored) via `data/config.ts`.

## Next steps

1. **Step 5 — ticket type.** The rate cards (`.tarifCardsRow > *`) already render after movie
   selection; `_explore.spec.ts` logs their labels. Add ticket-type selection to `TicketsPage`
   (pick any available type, dynamically — same non-hardcoded approach as movie selection).
2. **Step 6 — add to sale + checkout + order summary.** Explore this DOM, then build the "add to
   sale" / "proceed to checkout" actions and an order-summary assertion (likely still `TicketsPage`
   plus a new checkout page object).
3. **Step 7 — cash payment.** Explore and build `pages/CheckoutPage.ts` for the Cash payment flow;
   assert the transaction completes without errors.
4. Keep extending `tests/ticket-purchase.spec.ts` step by step so it stays a real,
   currently-passing test rather than a big-bang change at the end.
5. Once every screen has a real page object, delete `tests/_explore.spec.ts`.

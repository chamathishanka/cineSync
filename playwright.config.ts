import { defineConfig, devices } from '@playwright/test';

/* Environment variables (base URL, credentials) are read from .env - see data/config.ts. */
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/* See https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testDir: './tests',

  /* The QA licence is single-seat: a second concurrent login invalidates the first
     session server-side, so the suite always runs serially - not only on CI. */
  fullyParallel: false,
  workers: 1,

  /* Fail the build on CI if a test.only was left in the source. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL,
    /* Capture a trace on the first retry to debug failures. */
    trace: 'on-first-retry',
  },

  /* The npm scripts run Chromium by default to keep the single-seat session simple;
     Firefox and WebKit stay available via `--project=firefox` / `--project=webkit`. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from custom .env files.
 * Example usage:
 *   ENV=qa npx playwright test
 *   ENV=staging npx playwright test
 */
const environment = process.env.ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `.env.${environment}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright test configuration.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* Dedicated directory for test specs */
  testDir: './tests',

  /* Maximum time a single test can run (120 seconds) */
  timeout: 120 * 1000,

  /* Default timeout for expect assertions (10 seconds) */
  expect: {
    timeout: 10 * 1000,
  },

  /* Run tests sequentially to avoid live backend state collisions */
  fullyParallel: false,

  /* Fail the build on CI if test.only is left in the code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Sequential worker count for state consistency */
  workers: 1,

  /* Reporter setup: List for CLI console output, HTML for detailed reports */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* Shared settings for browser contexts and page actions */
  use: {
    /* Slow down actions only when SLOWMO environment variable is set (e.g. SLOWMO=350) */
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0,
    },

    /* Base URL to use in page.goto('/') calls. Set via environment variable. */
    baseURL: process.env.BASE_URL || 'http://199.199.50.165:3000',

    /* Maximum time each action (click, fill, wait) can take (15 seconds) */
    actionTimeout: 15 * 1000,

    /* Ignore HTTPS certificate errors in test environments */
    ignoreHTTPSErrors: true,

    /* Default viewport size for desktop layout consistency */
    viewport: { width: 1600, height: 900 },

    /* Record trace on failure/retry for debugging */
    trace: 'retain-on-failure',

    /* Capture screenshot only when a test fails */
    screenshot: 'only-on-failure',

    /* Record video only on failure to conserve storage/CI bandwidth */
    video: 'on',
  },

  /* Configure projects for browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
      },
    },

    /* 
    // Uncomment to enable additional browsers in the future:
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],
});

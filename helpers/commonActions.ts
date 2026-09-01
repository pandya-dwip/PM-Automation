import { Page, test, expect } from '@playwright/test';
import { LoginLocators } from '../pages/auth/login.locators';
import { USER_CREDENTIALS, UserRole, USER_ROLES } from './credentials';
import { ENDPOINTS } from './endpoints';

/**
 * Performs role-based login by specifying the user role.
 * Automatically clears session cookies/localStorage if switching roles from an active session.
 * Wraps actions in Playwright test steps for detailed test reporting and validates URL endpoint.
 *
 * Example Usage:
 *   await loginAs(page, USER_ROLES.DEVELOPER); // Login as Developer
 *   await loginAs(page, USER_ROLES.ACCOUNTS);  // Login as Accounts
 *
 * @param page Playwright Page instance
 * @param role The UserRole to log in with (defaults to DEVELOPER)
 */
export async function loginAs(
  page: Page,
  role: UserRole = USER_ROLES.DEVELOPER
): Promise<void> {
  const loginLocators = new LoginLocators(page);
  const user = USER_CREDENTIALS[role];

  if (!user || !user.username) {
    throw new Error(
      `Credentials for role '${role}' are not configured in helpers/credentials.ts or .env`
    );
  }

  await test.step(`Login as ${role} user (${user.username})`, async () => {
    // Clear cookies & storage to allow re-login if switching active sessions
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore if storage is inaccessible
      }
    });

    // Navigate to Login page & validate endpoint
    await page.goto(ENDPOINTS.AUTH.LOGIN);

    // Enter credentials and submit
    await loginLocators.usernameInput.fill(user.username);
    await loginLocators.passwordInput.fill(user.password);
    await loginLocators.submitBtn.click();

    // Validate post-login navigation to Home endpoint
    await page.waitForURL(`**${ENDPOINTS.HOME}**`);
    await expectStrictEndpoint(page, ENDPOINTS.HOME);
  });
}

/**
 * Strictly verifies that the current page URL matches the exact path of the endpoint.
 * Ensures '/requisition-form' does NOT match '/requisition-forms' or unexpected substrings.
 *
 * @param page Playwright Page instance
 * @param endpoint Relative endpoint path (e.g. '/requisition-form', '/home')
 */
export async function expectStrictEndpoint(page: Page, endpoint: string): Promise<void> {
  const escaped = endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const strictRegex = new RegExp(`^https?://[^/]+${escaped}(?:[?#].*)?$`);
  await expect(page).toHaveURL(strictRegex);
}

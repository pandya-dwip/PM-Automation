import { test as baseTest, expect } from '@playwright/test';
import { HeaderNavigationLocators } from '../pages/Dashboard/headerNavigations.locators';
import { LoginLocators } from '../pages/auth/login.locators';
import { NewIndentLocators } from '../pages/Requisition/Indents/newIndent.locators';

/**
 * Interface defining all injected Page Object Models for Requisitions Management.
 */
export interface RequisitionTestFixtures {
  headerNav: HeaderNavigationLocators;
  loginLocators: LoginLocators;
  newIndent: NewIndentLocators;
}

/**
 * Extended Playwright Test Fixture providing pre-initialized Page Object Models for Requisition tests.
 */
export const test = baseTest.extend<RequisitionTestFixtures>({
  headerNav: async ({ page }, use) => {
    await use(new HeaderNavigationLocators(page));
  },
  loginLocators: async ({ page }, use) => {
    await use(new LoginLocators(page));
  },
  newIndent: async ({ page }, use) => {
    await use(new NewIndentLocators(page));
  },
});

export { expect };

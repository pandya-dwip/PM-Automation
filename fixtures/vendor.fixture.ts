import { test as baseTest, expect } from '@playwright/test';
import { HeaderNavigationLocators } from '../pages/Dashboard/headerNavigations.locators';
import { VendorRegistrationLocators } from '../pages/Vendor/vendorRegistration.locators';
import { VendorApprovalLocators } from '../pages/Vendor/vendorApproval.locators';
import { VendorEditLocators } from '../pages/Vendor/vendorEdit.locators';
import { VendorDatabaseLocators } from '../pages/Vendor/vendorDatabase.locators';
import { VendorDatabaseFiltersLocators } from '../pages/Vendor/vendorDatabaseFilters.locators';
import { MasterDatabaseLocators } from '../pages/Purchase/Databases/masterDatabase.locators';
import { LoginLocators } from '../pages/auth/login.locators';
export interface VendorTestFixtures {
  headerNav: HeaderNavigationLocators;
  vendorReg: VendorRegistrationLocators;
  vendorApproval: VendorApprovalLocators;
  vendorEdit: VendorEditLocators;
  vendorDb: VendorDatabaseLocators;
  vendorFilters: VendorDatabaseFiltersLocators;
  masterDb: MasterDatabaseLocators;
  loginLocators: LoginLocators;
}

/**
 * Extended Playwright Test Fixture providing pre-initialized Page Object Models for clean dependency injection.
 */
export const test = baseTest.extend<VendorTestFixtures>({
  headerNav: async ({ page }, use) => {
    await use(new HeaderNavigationLocators(page));
  },
  vendorReg: async ({ page }, use) => {
    await use(new VendorRegistrationLocators(page));
  },
  vendorApproval: async ({ page }, use) => {
    await use(new VendorApprovalLocators(page));
  },
  vendorEdit: async ({ page }, use) => {
    await use(new VendorEditLocators(page));
  },
  vendorDb: async ({ page }, use) => {
    await use(new VendorDatabaseLocators(page));
  },
  vendorFilters: async ({ page }, use) => {
    await use(new VendorDatabaseFiltersLocators(page));
  },
  masterDb: async ({ page }, use) => {
    await use(new MasterDatabaseLocators(page));
  },
  loginLocators: async ({ page }, use) => {
    await use(new LoginLocators(page));
  },
});

export { expect };

/**
 * @file VendorPoVerification.spec.ts
 * @description End-to-end test suite for Vendor Availability Verification in Purchase Order (PO) Generation (/generate-po).
 *
 * Workflow Covered:
 *  1. 🔐 Login as Developer (USER_ROLES.DEVELOPER) & register a new dynamic vendor on /vendor-registration.
 *  2. 🛒 Hover on Purchase menu & click Master Database (/master-table).
 *  3. 📊 Validate Master Database page heading & toolbar buttons (master-db-filters-btn, master-db-generate-po-btn, etc.).
 *  4. 🔘 Select the first available enabled checkbox row in Master Database to enable Generate PO button.
 *  5. 📄 Click Generate PO button (master-db-generate-po-btn) & navigate to /generate-po.
 *  6. ❌ Search unapproved registered vendor in Supplier Details autocomplete dropdown -> Verify vendor is NOT present ("No options").
 *  7. ✅ Navigate to Vendor Approval (/vendor-approval), search vendor, & click Approve.
 *  8. 🔄 Return to Master Database (/master-table) -> Select row -> Click Generate PO (/generate-po).
 *  9. 🎯 Search vendor in Supplier Details dropdown -> Strictly verify approved vendor IS now visible & selectable in dropdown options!
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - pages/Purchase/Databases/masterDatabase.locators.ts → MasterDatabaseLocators
 *  - Data/Vendor/vendor-test-data.ts               → VENDOR_TEST_DATA
 */

import { test, expect } from '@playwright/test';
import {
  loginAs,
  USER_ROLES,
  ENDPOINTS,
  TOAST_MESSAGES,
  expectStrictEndpoint,
  logHeader,
  logStep,
  logData,
  logSuccess,
  logFinish,
} from '../../helpers';
import { HeaderNavigationLocators } from '../../pages/Dashboard/headerNavigations.locators';
import { VendorRegistrationLocators } from '../../pages/Vendor/vendorRegistration.locators';
import { VendorApprovalLocators } from '../../pages/Vendor/vendorApproval.locators';
import { MasterDatabaseLocators } from '../../pages/Purchase/Databases/masterDatabase.locators';
import { VENDOR_TEST_DATA } from '../../Data/Vendor/vendor-test-data';

test.describe('🛒 Purchase Module — PO Generation Vendor Availability Verification', () => {

  test('🎯 Verify unapproved vendor is absent from PO dropdown & becomes available after approval', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const masterDbLocators = new MasterDatabaseLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // ── Phase 1: Login & Register New Vendor ─────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Register New Vendor', async () => {
      logHeader('PHASE 1', 'Developer Login & Vendor Registration');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep(`Registering vendor: "${vendorData.vendorName}"...`);
      logData('Vendor Name', vendorData.vendorName);
      logData('Contact Person', vendorData.contactPerson);
      logData('GST Number', vendorData.gstNumber);

      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      await vendorRegLocators.fillVendorRegistrationForm(vendorData);
      await vendorRegLocators.uploadDocuments(vendorData);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Unapproved vendor registered successfully: "${vendorData.vendorName}"`);
    });

    // ── Phase 2: Navigate to Master Database & Validate Toolbar ───────
    await test.step('Phase 2 : 🛒 Navigate to Purchase → Master Database', async () => {
      logHeader('PHASE 2', 'Navigate to Purchase Master Database');
      logStep('Hovering on Purchase header menu & clicking Master Database...');
      await headerNav.purchaseBtn.hover();
      await headerNav.purchase.masterDatabase.click();

      logStep('Verifying navigation URL matches /master-table...');
      await expectStrictEndpoint(page, ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN);

      logStep('Verifying Master Database heading & toolbar buttons (master-db-generate-po-btn)...');
      await expect(masterDbLocators.pageHeading).toBeVisible();
      await expect(masterDbLocators.generatePoBtn).toBeVisible();
      logSuccess(`Master Database loaded: "${page.url()}"`);
    });

    // ── Phase 3: Select Checkbox Row & Click Generate PO ─────────────
    await test.step('Phase 3 : 🔘 Select Available Row & Navigate to PO Generation', async () => {
      logHeader('PHASE 3', 'Select Row & Click Generate PO');
      logStep('Selecting the first available enabled checkbox row in Master Database table...');
      await masterDbLocators.selectFirstAvailableRow();

      logStep('Verifying Generate PO button (master-db-generate-po-btn) is enabled...');
      await expect(masterDbLocators.generatePoBtn).toBeEnabled();

      logStep('Clicking Generate PO button...');
      await masterDbLocators.clickGeneratePo();

      logStep('Verifying navigation URL matches /generate-po...');
      await expectStrictEndpoint(page, ENDPOINTS.PURCHASE.MASTER_DATABASE.GENERATE_PO);
      logSuccess('Navigated to PO Generation page (/generate-po).');
    });

    // ── Phase 4: Verify Unapproved Vendor is NOT Available ───────────
    await test.step('Phase 4 : ❌ Verify Unapproved Vendor is ABSENT in Supplier Details Dropdown', async () => {
      logHeader('PHASE 4', 'Verify Unapproved Vendor Absence in PO Dropdown');
      logStep(`Searching for unapproved vendor: "${vendorData.vendorName}" in Supplier Details dropdown...`);
      logData('Searched Vendor', vendorData.vendorName);
      await masterDbLocators.searchVendorInPoDropdown(vendorData.vendorName);
      await page.waitForTimeout(500);

      const vendorOption = masterDbLocators.getVendorOption(vendorData.vendorName);
      logStep('Asserting unapproved vendor option is NOT visible in dropdown...');
      await expect(vendorOption).not.toBeVisible();

      logStep('Asserting "No options" message is displayed...');
      await expect(masterDbLocators.noOptionsMessage).toBeVisible();
      logSuccess(`Unapproved vendor "${vendorData.vendorName}" is correctly ABSENT from PO dropdown ("No options" verified)!`);
    });

    // ── Phase 5: Approve Vendor on Approval Page ─────────────────────
    await test.step('Phase 5 : ✅ Navigate to Vendor Approval Page & Approve Vendor', async () => {
      logHeader('PHASE 5', 'Approve Vendor on Approval Page');
      logStep('Hovering on Vendor header dropdown & clicking Vendor Approval link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      logStep(`Searching for vendor in Approval queue: "${vendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(vendorData.vendorName);

      logStep('Clicking Approve button & confirming modal...');
      await vendorApprovalLocators.approveVendor(vendorData.vendorName);
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      logSuccess(`Vendor approved successfully: "${vendorData.vendorName}"`);
    });

    // ── Phase 6: Verify Approved Vendor IS NOW Available in PO Dropdown ──
    await test.step('Phase 6 : 🎯 Verify Approved Vendor IS VISIBLE & Selectable in PO Dropdown', async () => {
      logHeader('PHASE 6', 'Verify Approved Vendor Presence in PO Dropdown');
      logStep('Navigating back to Purchase → Master Database...');
      await headerNav.purchaseBtn.hover();
      await headerNav.purchase.masterDatabase.click();
      await expectStrictEndpoint(page, ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN);

      logStep('Selecting row checkbox & clicking Generate PO button...');
      await masterDbLocators.selectFirstAvailableRow();
      await expect(masterDbLocators.generatePoBtn).toBeEnabled();
      await masterDbLocators.clickGeneratePo();
      await expectStrictEndpoint(page, ENDPOINTS.PURCHASE.MASTER_DATABASE.GENERATE_PO);

      logStep(`Searching for approved vendor: "${vendorData.vendorName}" in Supplier Details dropdown...`);
      logData('Searched Approved Vendor', vendorData.vendorName);
      await masterDbLocators.searchVendorInPoDropdown(vendorData.vendorName);
      await page.waitForTimeout(500);

      const vendorOption = masterDbLocators.getVendorOption(vendorData.vendorName);
      logStep('Asserting approved vendor option IS VISIBLE in dropdown list...');
      await expect(vendorOption).toBeVisible();

      logStep('Clicking approved vendor option to confirm selectability...');
      await vendorOption.click();

      logSuccess(`Approved vendor "${vendorData.vendorName}" is NOW VISIBLE & selectable in PO generation dropdown!`);
      logFinish('PO GENERATION VENDOR AVAILABILITY VERIFICATION COMPLETED SUCCESSFULLY');
    });

  });

});

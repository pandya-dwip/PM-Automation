/**
 * @file VendorRejection.spec.ts
 * @description End-to-end test for Vendor Rejection workflow with remarks & count validation.
 *
 * Scenario Covered:
 *  🔐 Developer logs in → validates Home endpoint →
 *     navigates to Vendor Registration → registers new vendor →
 *     navigates to Vendor Approval → reads initial pending queue count →
 *     searches & rejects vendor (with mandatory remarks) →
 *     🔄 Reloads page → validates endpoint & pending count decreased by 1 (initialCount - 1).
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - Data/Vendor/vendor-test-data.ts               → VENDOR_TEST_DATA, VENDOR_REJECTION_REASONS
 */

import { test, expect } from '@playwright/test';
import {
  loginAs,
  USER_ROLES,
  ENDPOINTS,
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
import { VENDOR_TEST_DATA, VENDOR_REJECTION_REASONS } from '../../Data/Vendor/vendor-test-data';

test.describe('🏭 Vendor Management — Rejection Workflow', () => {

  test('❌ Reject pending vendor with remarks and validate queue count decreases by 1', async ({ page }) => {
    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);

    const newVendorData = VENDOR_TEST_DATA.validVendor;
    const rejectionRemarks = VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID;

    // ── Phase 1: Login & Endpoint Validation ─────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // ── Phase 2: Register New Vendor ─────────────────────────────────
    await test.step('Phase 2 : 📝 Register New Vendor for Rejection Testing', async () => {
      logHeader('PHASE 2', 'Register New Vendor');
      logStep('Navigating to Vendor Registration...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Registering Vendor: "${newVendorData.vendorName}"`);
      logData('Vendor Name', newVendorData.vendorName);
      logData('Contact Person', newVendorData.contactPerson);
      logData('GST Number', newVendorData.gstNumber);
      logData('PAN Number', newVendorData.panNumber);

      await vendorRegLocators.fillVendorRegistrationForm(newVendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      logSuccess('New vendor registered successfully for rejection queue testing.');
    });

    // ── Phase 3: Navigate & Read Initial Count ───────────────────────
    await test.step('Phase 3 : 📂 Navigate to Vendor Approval & Read Queue Count', async () => {
      logHeader('PHASE 3', 'Navigate to Vendor Approval Endpoint');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);
      logSuccess(`Vendor Approval page loaded & endpoint validated: "${page.url()}"`);
    });

    const initialCount = await vendorApprovalLocators.getPendingCount();
    logData('Initial Pending Count', initialCount);

    // ── Phase 4: Search & Reject Pending Vendor ──────────────────────
    await test.step('Phase 4 : ❌ Reject registered vendor with remarks', async () => {
      logHeader('PHASE 4', 'Reject Registered Vendor');
      logStep(`Searching for vendor: "${newVendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(newVendorData.vendorName);

      const vendorRow = vendorApprovalLocators.getVendorRow(newVendorData.vendorName);
      await expect(vendorRow.row).toBeVisible();

      logStep(`Rejecting Vendor: "${newVendorData.vendorName}" with remarks: "${rejectionRemarks}"`);
      logData('Rejection Remarks', rejectionRemarks);

      await vendorApprovalLocators.rejectVendor(newVendorData.vendorName, rejectionRemarks);
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      await page.waitForTimeout(1000);
      logSuccess(`Rejected vendor: "${newVendorData.vendorName}"`);
    });

    // ── Phase 5: Reload Page & Validate Pending Count Decreased by 1 ──
    await test.step('Phase 5 : 🔄 Reload page & Validate Pending Count (Initial - 1)', async () => {
      logHeader('PHASE 5', 'Verify Decreased Pending Count');
      logStep('Reloading Vendor Approval page to fetch updated server count...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      const updatedCount = await vendorApprovalLocators.getPendingCount();
      const expectedCount = initialCount - 1;

      logData('Count Before Rejection', initialCount);
      logData('Count After Rejection', updatedCount);
      logData('Expected Count', expectedCount);

      expect(updatedCount).toBe(expectedCount);
      logSuccess(`Pending vendor count successfully decreased by 1 (${initialCount} → ${updatedCount})`);
    });

    logFinish('VENDOR REJECTION WORKFLOW COMPLETED SUCCESSFULLY');
  });

});

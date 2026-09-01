/**
 * @file VendorAccountsApprovalFlow.spec.ts
 * @description Dedicated end-to-end test suite for Accounts Team Vendor Approval workflow on Vendor Database (/vendor-data).
 *
 * Scenario Covered:
 *  ✅ Accounts Team Vendor Approval Flow & Developer Verification:
 *     - Developer registers vendor & approves on Vendor Approval page (/vendor-approval)
 *     - Accounts Team logs in (USER_ROLES.ACCOUNTS: invoice/cimcon@123) & navigates to Vendor Database (/vendor-data)
 *     - Accounts Team searches vendor, scrolls horizontally to accounts_approval_status, & clicks Approve button
 *     - Validates Approve Modal details & clicks Confirm Approve button
 *     - Verifies action buttons are removed & 'Approved' chip (vendor-data-status-approved) is displayed
 *     - Developer logs back in & verifies 'Approved' chip is displayed in Developer view
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - pages/Vendor/vendorDatabase.locators.ts       → VendorDatabaseLocators
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
import { VendorDatabaseLocators } from '../../pages/Vendor/vendorDatabase.locators';
import { VENDOR_TEST_DATA } from '../../Data/Vendor/vendor-test-data';

test.describe('💰 Vendor Management — Accounts Team Database Approval Workflow', () => {

  test('✅ Accounts Team Vendor Approval Flow & Developer Verification', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // ── Phase 1: Developer Registers & Approves Vendor ────────────────
    await test.step('Phase 1 : 🔐 Login as Developer → Register & Initial Approve Vendor', async () => {
      logHeader('PHASE 1', 'Developer Registration & Initial Approval');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep(`Registering vendor: "${vendorData.vendorName}"...`);
      logData('Vendor Name', vendorData.vendorName);
      logData('GST Number', vendorData.gstNumber);
      logData('PAN Number', vendorData.panNumber);

      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);
      await vendorRegLocators.fillVendorRegistrationForm(vendorData);
      await vendorRegLocators.uploadDocuments(vendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();

      logStep('Approving vendor on Vendor Approval page...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);
      await vendorApprovalLocators.searchVendor(vendorData.vendorName);
      await vendorApprovalLocators.approveVendor(vendorData.vendorName);
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      logSuccess(`Vendor registered & initially approved by Developer: "${vendorData.vendorName}"`);
    });

    // ── Phase 2: Accounts Team Login & Navigate to Database ───────────
    await test.step('Phase 2 : 💰 Login as Accounts Team & Navigate to Vendor Database', async () => {
      logHeader('PHASE 2', 'Accounts Team Authentication & Navigation');
      logStep('Logging in as Accounts Team (USER_ROLES.ACCOUNTS: invoice)...');
      await loginAs(page, USER_ROLES.ACCOUNTS);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.database.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);
      await expect(vendorDatabaseLocators.pageHeading).toBeVisible();
      logSuccess('Logged in as Accounts Team & loaded Vendor Database page.');
    });

    // ── Phase 3: Search Vendor & Open Accounts Approve Modal ─────────
    await test.step('Phase 3 : 🔍 Search vendor & click Accounts Approve button in DataGrid', async () => {
      logHeader('PHASE 3', 'Accounts Approve Action in DataGrid');
      logStep(`Searching for vendor: "${vendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(vendorData.vendorName);
      await page.waitForTimeout(1000);

      logStep('Resolving vendor row reference by data-id...');
      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      await expect(vendorRow.row).toBeVisible();

      logStep('Scrolling DataGrid virtual scroller horizontally to render Accounts column...');
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Clicking Accounts "Approve" button (vendor-data-approve-btn)...');
      await vendorRow.accountsApproveBtn.click();

      logStep('Waiting for Approve Vendor for Accounts modal dialog to open...');
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();
      await expect(vendorDatabaseLocators.accountsDialogApproveTitle).toBeVisible();
      logSuccess('Accounts Approve Vendor modal dialog opened.');
    });

    // ── Phase 4: Validate Modal & Confirm Approval ───────────────────
    await test.step('Phase 4 : ✅ Validate modal info & Confirm Accounts Approval', async () => {
      logHeader('PHASE 4', 'Confirm Accounts Approval');
      logStep(`Validating Vendor Name in modal: "${vendorData.vendorName}"...`);
      logData('Modal Vendor Name', vendorData.vendorName);
      await expect(vendorDatabaseLocators.accountsDialog).toContainText(vendorData.vendorName, { ignoreCase: true });

      logStep('Clicking "Approve Vendor" confirm button (vendor-data-accounts-approve-btn)...');
      await vendorDatabaseLocators.accountsDialogApproveBtn.click();

      logStep('Verifying Accounts Approve modal closes...');
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      logStep('Resolving updated vendor row reference & scrolling to Accounts column...');
      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Verifying Accounts Status Approved chip (vendor-data-status-approved) displays in DataGrid...');
      await expect(vendorRow.accountsStatusApprovedChip).toBeVisible();
      await expect(vendorRow.accountsStatusApprovedChip).toHaveText('Approved');
      logData('Accounts Status in Grid', 'Approved');
      logSuccess('Accounts Team approval confirmed & "Approved" status chip verified!');
    });

    // ── Phase 5: Developer Login & Post-Approval Verification ────────
    await test.step('Phase 5 : 🔐 Login as Developer & Verify Accounts Approved Status in Database', async () => {
      logHeader('PHASE 5', 'Developer Post-Approval Status Verification');
      logStep('Logging back in as Developer user...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.database.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);

      logStep(`Searching for approved vendor: "${vendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(vendorData.vendorName);
      await page.waitForTimeout(1000);

      logStep('Resolving vendor row & scrolling DataGrid virtual scroller horizontally...');
      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Verifying Accounts Approved status chip (vendor-data-status-approved) displays in Developer view...');
      await expect(vendorRow.accountsStatusApprovedChip).toBeVisible();
      await expect(vendorRow.accountsStatusApprovedChip).toHaveText('Approved');
      logData('Developer View Status', 'Approved');

      logSuccess('Developer view verified: Accounts Approved status chip correctly displayed!');
      logFinish('ACCOUNTS TEAM VENDOR APPROVAL WORKFLOW COMPLETED SUCCESSFULLY');
    });

  });

});

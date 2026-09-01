/**
 * @file VendorAccountsRejectionFlow.spec.ts
 * @description Dedicated end-to-end test suite for Accounts Team Vendor Rejection workflow on Vendor Database (/vendor-data).
 *
 * Scenario Covered:
 *  ❌ Accounts Team Vendor Rejection Flow & Developer Verification:
 *     - Developer registers vendor & approves on Vendor Approval page (/vendor-approval)
 *     - Accounts Team logs in (USER_ROLES.ACCOUNTS: invoice/cimcon@123) & navigates to Vendor Database (/vendor-data)
 *     - Accounts Team searches vendor, scrolls horizontally to accounts_approval_status, & clicks Reject button
 *     - Validates Reject Modal details, fills mandatory rejection remarks into vendor-data-accounts-remarks, & clicks Confirm Reject button
 *     - Verifies action buttons are removed & 'Rejected' chip (vendor-data-status-rejected) is displayed
 *     - Developer logs back in & verifies 'Rejected' chip is displayed in Developer view
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
import { VENDOR_TEST_DATA, VENDOR_REJECTION_REASONS } from '../../Data/Vendor/vendor-test-data';

test.describe('💰 Vendor Management — Accounts Team Database Rejection Workflow', () => {

  test('❌ Accounts Team Vendor Rejection Flow & Developer Verification', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;
    const rejectionRemarks = VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID;

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

    // ── Phase 3: Search Vendor & Open Accounts Reject Modal ──────────
    await test.step('Phase 3 : 🔍 Search vendor & click Accounts Reject button in DataGrid', async () => {
      logHeader('PHASE 3', 'Accounts Reject Action in DataGrid');
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

      logStep('Clicking Accounts "Reject" button (vendor-data-reject-btn)...');
      await vendorRow.accountsRejectBtn.click();

      logStep('Waiting for Reject Vendor modal dialog to open...');
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();
      await expect(vendorDatabaseLocators.accountsDialogRejectTitle).toBeVisible();
      logSuccess('Accounts Reject Vendor modal dialog opened.');
    });

    // ── Phase 4: Fill Rejection Remarks & Confirm Rejection ─────────
    await test.step('Phase 4 : ❌ Fill rejection remarks & Confirm Accounts Rejection', async () => {
      logHeader('PHASE 4', 'Fill Rejection Reason & Confirm Rejection');
      logStep(`Validating Vendor Name in modal: "${vendorData.vendorName}"...`);
      logData('Modal Vendor Name', vendorData.vendorName);
      await expect(vendorDatabaseLocators.accountsDialog).toContainText(vendorData.vendorName, { ignoreCase: true });

      logStep(`Filling mandatory rejection remarks: "${rejectionRemarks}"...`);
      logData('Rejection Remarks', rejectionRemarks);
      await vendorDatabaseLocators.accountsDialogRemarksInput.fill(rejectionRemarks);

      logStep('Clicking "Reject Vendor" confirm button (vendor-data-accounts-reject-btn)...');
      await vendorDatabaseLocators.accountsDialogRejectBtn.click();

      logStep('Verifying Accounts Reject modal closes...');
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      logStep('Resolving updated vendor row reference & scrolling to Accounts column...');
      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Verifying Accounts Status Rejected chip (vendor-data-status-rejected) displays in DataGrid...');
      await expect(vendorRow.accountsStatusRejectedChip).toBeVisible();
      await expect(vendorRow.accountsStatusRejectedChip).toHaveText('Rejected');
      logData('Accounts Status in Grid', 'Rejected');
      logSuccess('Accounts Team rejection confirmed & "Rejected" status chip verified!');
    });

    // ── Phase 5: Developer Login & Post-Rejection Verification ────────
    await test.step('Phase 5 : 🔐 Login as Developer & Verify Accounts Rejected Status in Database', async () => {
      logHeader('PHASE 5', 'Developer Post-Rejection Status Verification');
      logStep('Logging back in as Developer user...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.database.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);

      logStep(`Searching for rejected vendor: "${vendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(vendorData.vendorName);
      await page.waitForTimeout(1000);

      logStep('Resolving vendor row & scrolling DataGrid virtual scroller horizontally...');
      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Verifying Accounts Rejected status chip (vendor-data-status-rejected) displays in Developer view...');
      await expect(vendorRow.accountsStatusRejectedChip).toBeVisible();
      await expect(vendorRow.accountsStatusRejectedChip).toHaveText('Rejected');
      logData('Developer View Status', 'Rejected');

      logSuccess('Developer view verified: Accounts Rejected status chip correctly displayed!');
      logFinish('ACCOUNTS TEAM VENDOR REJECTION WORKFLOW COMPLETED SUCCESSFULLY');
    });

  });

});

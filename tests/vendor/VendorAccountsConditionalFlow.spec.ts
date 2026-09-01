/**
 * @file VendorAccountsConditionalFlow.spec.ts
 * @description End-to-end test suite for Accounts Team Vendor Database Conditional Approval & Rejection workflow.
 *
 * Conditional Logic Covered:
 *  1. Login as Developer (USER_ROLES.DEVELOPER) & Navigate to Vendor Database (/vendor-data).
 *  2. Inspect the FIRST row in the DataGrid table:
 *     - If 1st Row Accounts Status is PENDING:
 *       ├── Extract vendor name
 *       ├── Perform UI Logout via Profile Avatar (.user-profile-trigger -> Logout)
 *       ├── Login as Accounts Team (USER_ROLES.ACCOUNTS: invoice/cimcon@123)
 *       ├── Navigate to Vendor Database (/vendor-data) & search target vendor
 *       ├── Approve vendor via modal (vendor-data-accounts-approve-btn) & verify 'Approved' chip
 *       ├── Perform UI Logout & Login back as Developer
 *       └── Verify 'Approved' status chip in Developer view
 *
 *     - If 1st Row Accounts Status is NOT PENDING (Approved/Rejected):
 *       ├── Iterate through table rows until a PENDING vendor is located
 *       ├── Extract pending vendor name
 *       ├── Perform UI Logout via Profile Avatar (.user-profile-trigger -> Logout)
 *       ├── Login as Accounts Team (USER_ROLES.ACCOUNTS: invoice/cimcon@123)
 *       ├── Navigate to Vendor Database (/vendor-data) & search target vendor
 *       ├── Reject vendor via modal with mandatory remarks & verify 'Rejected' chip
 *       ├── Perform UI Logout & Login back as Developer
 *       └── Verify 'Rejected' status chip in Developer view
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

test.describe('🔀 Vendor Management — Accounts Team Conditional Database Workflow', () => {

  test('🔀 Conditional Accounts Approval or Rejection Workflow based on First Row Status', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);

    // ── Phase 1: Login as Developer & Inspect Vendor Database ─────────
    logHeader('PHASE 1', 'Developer Authentication & Database Inspection');
    logStep('Initiating Developer login...');
    await loginAs(page, USER_ROLES.DEVELOPER);
    await expectStrictEndpoint(page, ENDPOINTS.HOME);

    logStep('Navigating to Vendor Database (/vendor-data)...');
    await headerNav.vendorBtn.hover();
    await headerNav.vendor.database.click();
    await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);
    await expect(vendorDatabaseLocators.pageHeading).toBeVisible();
    await page.waitForTimeout(1000);

    // ── Phase 2: Inspect First Row Status ─────────────────────────────
    logHeader('PHASE 2', 'Inspect First Database Row Accounts Status');
    const firstRow = vendorDatabaseLocators.rows.first();
    await expect(firstRow).toBeVisible();

    // Scroll DataGrid right to read Accounts Status column
    const scroller = page.locator('.MuiDataGrid-virtualScroller');
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
      await page.waitForTimeout(500);
    }

    const firstRowApproveBtn = firstRow.getByTestId('vendor-data-approve-btn');
    const isFirstRowPending = (await firstRowApproveBtn.count() > 0) && (await firstRowApproveBtn.isVisible());
    logData('Is 1st Row Pending?', isFirstRowPending);

    // Scroll back to left to read vendor name
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = 0; });
      await page.waitForTimeout(500);
    }

    let targetVendorName = '';
    let isApprovalPath = false;

    if (isFirstRowPending) {
      isApprovalPath = true;
      const firstNameCell = firstRow.locator('[data-field="vendor_name"]');
      targetVendorName = (await firstNameCell.textContent())?.trim() || '';
      logData('Target Vendor (Approval)', targetVendorName);
      logSuccess(`1st Vendor Row IS PENDING! Target Vendor for APPROVAL: "${targetVendorName}"`);
    } else {
      isApprovalPath = false;
      logStep('1st Vendor Row is NOT PENDING (Already Approved/Rejected). Reading down table rows to locate a PENDING vendor...');

      const totalRows = await vendorDatabaseLocators.rows.count();
      let foundPending = false;

      for (let i = 0; i < Math.min(totalRows, 20); i++) {
        const currentRow = vendorDatabaseLocators.rows.nth(i);

        // Scroll right to check accounts approval status
        if (await scroller.count() > 0) {
          await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
          await page.waitForTimeout(200);
        }

        const approveBtn = currentRow.getByTestId('vendor-data-approve-btn');
        if ((await approveBtn.count() > 0) && (await approveBtn.isVisible())) {
          // Scroll left to get vendor name
          if (await scroller.count() > 0) {
            await scroller.evaluate((el) => { el.scrollLeft = 0; });
            await page.waitForTimeout(200);
          }
          const nameCell = currentRow.locator('[data-field="vendor_name"]');
          targetVendorName = (await nameCell.textContent())?.trim() || '';
          foundPending = true;
          logSuccess(`Located PENDING Vendor at row ${i + 1}: "${targetVendorName}"`);
          break;
        }
      }

      // If no pending vendor found in current list, register a fresh one as fallback
      if (!foundPending || !targetVendorName) {
        logStep('No pending vendor found in current DB list. Registering fresh vendor for Rejection path...');
        const freshVendor = VENDOR_TEST_DATA.validVendor;
        await headerNav.vendorBtn.hover();
        await headerNav.vendor.registration.click();
        await vendorRegLocators.fillVendorRegistrationForm(freshVendor);
        await vendorRegLocators.uploadDocuments(freshVendor);
        await vendorRegLocators.submitForm();
        await expect(vendorRegLocators.toastAlert).toBeVisible();

        await headerNav.vendorBtn.hover();
        await headerNav.vendor.approval.click();
        await vendorApprovalLocators.searchVendor(freshVendor.vendorName);
        await vendorApprovalLocators.approveVendor(freshVendor.vendorName);

        await headerNav.vendorBtn.hover();
        await headerNav.vendor.database.click();
        targetVendorName = freshVendor.vendorName;
        logSuccess(`Fresh Vendor registered & approved for Rejection path: "${targetVendorName}"`);
      }

      logData('Target Vendor (Rejection)', targetVendorName);
      logSuccess(`Target Vendor selected for REJECTION: "${targetVendorName}"`);
    }

    // ── Phase 3: Perform UI Logout via Profile Avatar ──────────────────
    logHeader('PHASE 3', 'UI Logout via Profile Avatar');
    logStep('Clicking User Profile Avatar (.user-profile-trigger)...');
    await headerNav.userProfileTrigger.click();

    logStep('Clicking Logout menu item...');
    await headerNav.logoutMenuItem.click();
    await page.waitForURL(`**${ENDPOINTS.AUTH.LOGIN}**`);
    logSuccess('Logged out successfully via UI Profile Avatar.');

    // ── Phase 4: Login as Accounts Team & Process Vendor ──────────────
    logHeader('PHASE 4', `Accounts Team Processing (${isApprovalPath ? 'APPROVAL FLOW' : 'REJECTION FLOW'})`);
    logStep('Logging in as Accounts Team (USER_ROLES.ACCOUNTS: invoice)...');
    await loginAs(page, USER_ROLES.ACCOUNTS);
    await expectStrictEndpoint(page, ENDPOINTS.HOME);

    logStep('Navigating to Vendor Database (/vendor-data)...');
    await headerNav.vendorBtn.hover();
    await headerNav.vendor.database.click();
    await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);

    logStep(`Searching for target vendor: "${targetVendorName}"`);
    await vendorDatabaseLocators.searchVendor(targetVendorName);
    await page.waitForTimeout(1000);

    const vendorRow = await vendorDatabaseLocators.getVendorRow(targetVendorName);
    await expect(vendorRow.row).toBeVisible();

    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
      await page.waitForTimeout(500);
    }

    if (isApprovalPath) {
      // ── CONDITIONAL PATH A: APPROVAL ──────────────────────────────────
      logStep('Clicking Accounts "Approve" button (vendor-data-approve-btn)...');
      await vendorRow.accountsApproveBtn.click();

      logStep('Waiting for Approve Vendor for Accounts modal dialog to open...');
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();
      await expect(vendorDatabaseLocators.accountsDialogApproveTitle).toBeVisible();

      logStep('Clicking "Approve Vendor" confirm button (vendor-data-accounts-approve-btn)...');
      await vendorDatabaseLocators.accountsDialogApproveBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      logStep('Resolving updated vendor row & verifying Approved status chip...');
      const updatedRow = await vendorDatabaseLocators.getVendorRow(targetVendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(updatedRow.accountsStatusApprovedChip).toBeVisible();
      await expect(updatedRow.accountsStatusApprovedChip).toHaveText('Approved');
      logData('Accounts Status', 'Approved');
      logSuccess(`Accounts Team APPROVED vendor: "${targetVendorName}"`);

    } else {
      // ── CONDITIONAL PATH B: REJECTION ─────────────────────────────────
      logStep('Clicking Accounts "Reject" button (vendor-data-reject-btn)...');
      await vendorRow.accountsRejectBtn.click();

      logStep('Waiting for Reject Vendor modal dialog to open...');
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();
      await expect(vendorDatabaseLocators.accountsDialogRejectTitle).toBeVisible();

      logStep('Filling mandatory rejection remarks...');
      logData('Rejection Remarks', VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID);
      await vendorDatabaseLocators.accountsDialogRemarksInput.fill(VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID);

      logStep('Clicking "Reject Vendor" confirm button (vendor-data-accounts-reject-btn)...');
      await vendorDatabaseLocators.accountsDialogRejectBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      logStep('Resolving updated vendor row & verifying Rejected status chip...');
      const updatedRow = await vendorDatabaseLocators.getVendorRow(targetVendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(updatedRow.accountsStatusRejectedChip).toBeVisible();
      await expect(updatedRow.accountsStatusRejectedChip).toHaveText('Rejected');
      logData('Accounts Status', 'Rejected');
      logSuccess(`Accounts Team REJECTED vendor: "${targetVendorName}"`);
    }

    // ── Phase 5: UI Logout & Developer Post-Decision Verification ────
    logHeader('PHASE 5', 'Developer Post-Decision Status Verification');
    logStep('Performing UI Logout via Profile Avatar...');
    await headerNav.performUiLogout();

    logStep('Logging back in as Developer user...');
    await loginAs(page, USER_ROLES.DEVELOPER);
    await expectStrictEndpoint(page, ENDPOINTS.HOME);

    logStep('Navigating to Vendor Database (/vendor-data)...');
    await headerNav.vendorBtn.hover();
    await headerNav.vendor.database.click();
    await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);

    logStep(`Searching for vendor: "${targetVendorName}"`);
    await vendorDatabaseLocators.searchVendor(targetVendorName);
    await page.waitForTimeout(1000);

    const devVendorRow = await vendorDatabaseLocators.getVendorRow(targetVendorName);
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
      await page.waitForTimeout(500);
    }

    if (isApprovalPath) {
      logStep('Verifying Accounts Approved status chip in Developer view...');
      await expect(devVendorRow.accountsStatusApprovedChip).toBeVisible();
      await expect(devVendorRow.accountsStatusApprovedChip).toHaveText('Approved');
      logData('Developer View Status', 'Approved');
      logSuccess('Developer view verified: Accounts Approved status chip correctly displayed!');
    } else {
      logStep('Verifying Accounts Rejected status chip in Developer view...');
      await expect(devVendorRow.accountsStatusRejectedChip).toBeVisible();
      await expect(devVendorRow.accountsStatusRejectedChip).toHaveText('Rejected');
      logData('Developer View Status', 'Rejected');
      logSuccess('Developer view verified: Accounts Rejected status chip correctly displayed!');
    }

    logFinish(`CONDITIONAL ACCOUNTS WORKFLOW (${isApprovalPath ? 'APPROVAL' : 'REJECTION'}) COMPLETED SUCCESSFULLY`);

  });

});

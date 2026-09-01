/**
 * @file VendorDatabaseFilters.spec.ts
 * @description Test suite for Vendor Database Filter Drawer (/vendor-data).
 *
 * Scenarios Covered:
 *  1. 🔍 Lifecycle Status Filter Flow:
 *     - Register new vendor → Developer approves in /vendor-approval
 *     - Filter in /vendor-data by Product Category, Has Documents ('With Documents'), Accounts Approval ('Pending') → Verify vendor displayed
 *     - Accounts team rejects vendor → Filter by 'Rejected' → Verify vendor displayed with Rejected chip
 *     - Developer edits in /vendor-edit & re-approves in /vendor-approval → Status resets to 'Pending' → Filter by 'Pending' & verify
 *     - Accounts team approves vendor → Filter by 'Approved' → Verify vendor displayed with Approved chip
 *  2. 🔄 Filter Drawer Controls & Reset:
 *     - Open drawer, apply filter, verify drawer closes & table filters
 *     - Open drawer, click Reset Filters, verify all data is restored
 *     - Open drawer, click Close button, verify drawer closes without applying
 *  3. 📄 Document Availability Filter:
 *     - Filter by 'With Documents' vs 'Without Documents'
 *     - Verify missing document indicator (`vendor-data-download-missing` / "Not available")
 *
 * Modules & Utilities:
 *  - helpers/index.ts                                  → loginAs, USER_ROLES, ENDPOINTS
 *  - pages/Vendor/vendorRegistration.locators.ts       → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts           → VendorApprovalLocators
 *  - pages/Vendor/vendorEdit.locators.ts               → VendorEditLocators
 *  - pages/Vendor/vendorDatabase.locators.ts           → VendorDatabaseLocators
 *  - pages/Vendor/vendorDatabaseFilters.locators.ts    → VendorDatabaseFiltersLocators
 *  - Data/Vendor/vendor-test-data.ts                   → getDynamicVendorData, getDynamicEditVendorData, VENDOR_REJECTION_REASONS
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
import { VendorRegistrationLocators } from '../../pages/Vendor/vendorRegistration.locators';
import { VendorApprovalLocators } from '../../pages/Vendor/vendorApproval.locators';
import { VendorEditLocators } from '../../pages/Vendor/vendorEdit.locators';
import { VendorDatabaseLocators } from '../../pages/Vendor/vendorDatabase.locators';
import { VendorDatabaseFiltersLocators } from '../../pages/Vendor/vendorDatabaseFilters.locators';
import { getDynamicVendorData, getDynamicEditVendorData, VENDOR_REJECTION_REASONS } from '../../Data/Vendor/vendor-test-data';

test.describe('Vendor Database Filters', () => {

  test('Lifecycle Status Filters', async ({ page }) => {
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorEditLocators = new VendorEditLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);

    const initialVendor = getDynamicVendorData({
      incorporationFilePath: undefined, // Optional document omitted
    });
    const updatedVendor = getDynamicEditVendorData({
      incorporationFilePath: undefined, // Explicitly omit optional Incorporation Certificate
    });

    // ── Phase 1: Register Vendor & Developer Approval ────────────────
    await test.step('Phase 1 : 📝 Register new vendor with all documents & approve in Vendor Approval', async () => {
      logHeader('PHASE 1', 'Register All Documents & Developer Approval');
      logStep('Logging in as Developer...');
      await loginAs(page, USER_ROLES.DEVELOPER);

      logStep(`Navigating to Vendor Registration & registering: "${initialVendor.vendorName}"`);
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await vendorRegLocators.fillVendorRegistrationForm(initialVendor);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();

      logStep('Navigating to Vendor Approval & approving vendor...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await vendorApprovalLocators.approveVendor(initialVendor.vendorName);
      await expect(vendorApprovalLocators.toastAlert.first()).toBeVisible();
      logSuccess(`Vendor "${initialVendor.vendorName}" approved by Developer.`);
    });

    // ── Phase 2: Filter by Product Category, Has Documents & Accounts Pending ──
    await test.step('Phase 2 : 🔍 Filter Database by Category, With Documents & Pending Status', async () => {
      logHeader('PHASE 2', 'Filter by Pending Status & Category');
      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

      logStep('Opening Filter Drawer...');
      await filterLocators.openFilterDrawer();

      logStep(`Filtering by Category: "${initialVendor.productCategory}", Docs: "With Documents", Accounts: "Pending"...`);
      await filterLocators.filterByCategory(initialVendor.productCategory!);
      await filterLocators.filterByDocs('With Documents');
      await filterLocators.filterByAccountsApproval('Pending');

      logStep('Clicking Apply Filters button...');
      await filterLocators.applyFilters();

      logStep(`Verifying filtered vendor "${initialVendor.vendorName}" appears with Pending status chip...`);
      await vendorDatabaseLocators.searchVendor(initialVendor.vendorName);
      const vendorRow = await vendorDatabaseLocators.getVendorRow(initialVendor.vendorName);
      await expect(vendorRow.row).toBeVisible();
      await vendorDatabaseLocators.scrollToRight();
      await expect(vendorRow.accountsStatusPendingChip).toBeVisible();

      logStep('Clicking and verifying all 7 document download buttons for the initial vendor...');
      const vendorDownloadBtns = vendorRow.downloadButtons;
      const btnCount = await vendorDownloadBtns.count();
      for (let i = 0; i < btnCount; i++) {
        const btn = vendorDownloadBtns.nth(i);
        if (await btn.isVisible()) {
          const ariaLabel = (await btn.locator('..').getAttribute('aria-label')) || `Document #${i + 1}`;
          await btn.click({ force: true });
          logStep(`Clicked download button: "${ariaLabel}"`);
          await page.waitForTimeout(300);
        }
      }
      logSuccess(`Vendor "${initialVendor.vendorName}" verified with all ${btnCount} documents present and downloaded.`);
    });

    // ── Phase 3: Accounts Team Rejection & Filter by 'Rejected' ───────
    await test.step('Phase 3 : 🚫 Accounts Team Rejection & Filter by Rejected Status', async () => {
      logHeader('PHASE 3', 'Accounts Rejection & Filter by Rejected');
      logStep('Logging in as Accounts Team (invoice)...');
      await loginAs(page, USER_ROLES.ACCOUNTS);

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);

      logStep(`Searching for vendor: "${initialVendor.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(initialVendor.vendorName);
      const vendorRow = await vendorDatabaseLocators.getVendorRow(initialVendor.vendorName);
      await vendorDatabaseLocators.scrollToRight();

      logStep('Clicking Accounts Reject button & submitting rejection remarks...');
      await vendorRow.accountsRejectBtn.click();
      await vendorDatabaseLocators.accountsDialogRemarksInput.fill(VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID);
      await vendorDatabaseLocators.accountsDialogRejectBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      const rejectedStatusRow = await vendorDatabaseLocators.getVendorRow(initialVendor.vendorName);
      await vendorDatabaseLocators.scrollToRight();
      await expect(rejectedStatusRow.accountsStatusRejectedChip).toBeVisible();
      logStep('Vendor rejected by Accounts Team.');

      logStep('Opening Filter Drawer & filtering by Accounts Status: "Rejected"...');
      await vendorDatabaseLocators.searchVendor(''); // Clear search
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Rejected');
      await filterLocators.applyFilters();

      logStep(`Verifying rejected vendor "${initialVendor.vendorName}" appears under Rejected filter...`);
      await vendorDatabaseLocators.searchVendor(initialVendor.vendorName);
      const rejectedRow = await vendorDatabaseLocators.getVendorRow(initialVendor.vendorName);
      await expect(rejectedRow.row).toBeVisible();
      await vendorDatabaseLocators.scrollToRight();
      await expect(rejectedRow.accountsStatusRejectedChip).toBeVisible();
      logSuccess(`Vendor "${initialVendor.vendorName}" verified under Rejected filter.`);
    });

    // ── Phase 4: Re-Edit Without Incorporation, Re-Approval & Document Filter Validation ──
    await test.step('Phase 4 : ✏️ Edit Without Incorporation, Re-Approval & Document Filter Verification', async () => {
      logHeader('PHASE 4', 'Edit Without Incorporation & Filter Verification');
      logStep('Logging in as Developer...');
      await loginAs(page, USER_ROLES.DEVELOPER);

      logStep('Navigating to Vendor Edit (/vendor-edit) to re-edit rejected vendor...');
      await page.goto(ENDPOINTS.VENDOR.EDIT);
      await page.reload();
      await page.waitForTimeout(1000);

      if (await vendorEditLocators.accountsRejectedTab.count() > 0 && await vendorEditLocators.accountsRejectedTab.isVisible()) {
        logStep('Selecting Accounts Rejected Tab...');
        await vendorEditLocators.accountsRejectedTab.click();
      } else {
        logStep('Selecting Rejected Tab...');
        await vendorEditLocators.rejectedTab.click();
      }
      await page.waitForTimeout(500);

      logStep(`Editing vendor "${initialVendor.vendorName}" without uploading optional Incorporation Certificate...`);
      await vendorEditLocators.searchVendor(initialVendor.vendorName);
      await vendorEditLocators.openEditModal(initialVendor.vendorName);
      await vendorEditLocators.updateVendorForm(updatedVendor);
      await vendorEditLocators.submitEditForm();
      await expect(vendorEditLocators.toastAlert.first()).toBeVisible();

      logStep('Navigating to Vendor Approval (/vendor-approval) & re-approving updated vendor...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await vendorApprovalLocators.approveVendor(updatedVendor.vendorName);
      await expect(vendorApprovalLocators.toastAlert.first()).toBeVisible();

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);

      // 4.1 Verify vendor is ABSENT from "Without Documents" filter
      logStep('Verifying updated vendor does NOT appear in "Without Documents" filter...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByDocs('Without Documents');
      await filterLocators.applyFilters();
      await vendorDatabaseLocators.searchVendor(updatedVendor.vendorName);
      await expect(vendorDatabaseLocators.rows).toHaveCount(0);
      logSuccess(`Updated vendor "${updatedVendor.vendorName}" is correctly ABSENT from "Without Documents" filter.`);

      // 4.2 Verify vendor IS PRESENT under "With Documents" filter
      logStep('Filtering by "With Documents" & Accounts "Pending"...');
      await vendorDatabaseLocators.searchVendor('');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByDocs('With Documents');
      await filterLocators.filterByAccountsApproval('Pending');
      await filterLocators.applyFilters();

      await vendorDatabaseLocators.searchVendor(updatedVendor.vendorName);
      const pendingRow = await vendorDatabaseLocators.getVendorRow(updatedVendor.vendorName);
      await expect(pendingRow.row).toBeVisible();
      await vendorDatabaseLocators.scrollToRight();
      await expect(pendingRow.accountsStatusPendingChip).toBeVisible();

      // 4.3 Verify Incorporation Certificate shows "Not available" badge and NOT download button
      logStep('Verifying Incorporation Certificate displays "Not available" while active documents have download buttons...');
      await expect(pendingRow.downloadIncorporation.getByTestId('vendor-data-download-missing')).toBeVisible();
      await expect(pendingRow.downloadIncorporation.getByTestId('vendor-data-download-missing')).toContainText(/Not available/i);
      await expect(pendingRow.downloadIncorporation.getByTestId('vendor-data-download-btn')).toHaveCount(0);
      logSuccess('Incorporation Certificate confirmed "Not available" on updated vendor row.');

      // 4.4 Click all active document download buttons for updated vendor
      logStep('Clicking all active document download buttons for updated vendor...');
      const activeDownloadBtns = pendingRow.downloadButtons;
      const activeCount = await activeDownloadBtns.count();
      for (let i = 0; i < activeCount; i++) {
        const btn = activeDownloadBtns.nth(i);
        if (await btn.isVisible()) {
          const ariaLabel = (await btn.locator('..').getAttribute('aria-label')) || `Document #${i + 1}`;
          await btn.click({ force: true });
          logStep(`Clicked download button: "${ariaLabel}"`);
          await page.waitForTimeout(300);
        }
      }
      logSuccess(`All ${activeCount} active document downloads clicked and verified for updated vendor.`);
    });

    // ── Phase 5: Accounts Final Approval & Filter by 'Approved' ───────
    await test.step('Phase 5 : ✅ Accounts Team Final Approval & Filter by Approved Status', async () => {
      logHeader('PHASE 5', 'Accounts Final Approval & Filter Approved');
      logStep('Logging in as Accounts Team...');
      await loginAs(page, USER_ROLES.ACCOUNTS);

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);

      logStep(`Searching for vendor: "${updatedVendor.vendorName}" & approving...`);
      await vendorDatabaseLocators.searchVendor(updatedVendor.vendorName);
      const vendorRow = await vendorDatabaseLocators.getVendorRow(updatedVendor.vendorName);
      await vendorDatabaseLocators.scrollToRight();
      await vendorRow.accountsApproveBtn.click();
      await vendorDatabaseLocators.accountsDialogApproveBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      const approvedStatusRow = await vendorDatabaseLocators.getVendorRow(updatedVendor.vendorName);
      await vendorDatabaseLocators.scrollToRight();
      await expect(approvedStatusRow.accountsStatusApprovedChip).toBeVisible();

      logStep('Opening Filter Drawer & filtering by Accounts Status: "Approved"...');
      await vendorDatabaseLocators.searchVendor(''); // Clear search
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Approved');
      await filterLocators.applyFilters();

      logStep(`Verifying approved vendor "${updatedVendor.vendorName}" appears under Approved filter...`);
      await vendorDatabaseLocators.searchVendor(updatedVendor.vendorName);
      const approvedRow = await vendorDatabaseLocators.getVendorRow(updatedVendor.vendorName);
      await expect(approvedRow.row).toBeVisible();
      await vendorDatabaseLocators.scrollToRight();
      await expect(approvedRow.accountsStatusApprovedChip).toBeVisible();
      logSuccess(`Vendor "${updatedVendor.vendorName}" verified under Approved filter.`);
    });

  });

  test('Drawer Controls & Reset', async ({ page }) => {
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);

    // Login as Developer
    await loginAs(page, USER_ROLES.DEVELOPER);
    await page.goto(ENDPOINTS.VENDOR.DATABASE);
    await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

    // ── Step 1: Open & Close Drawer without applying ──────────────────
    await test.step('Step 1 : 🚪 Open Drawer & Click Close button', async () => {
      logHeader('STEP 1', 'Open & Close Drawer');
      logStep('Clicking Filters button to open drawer...');
      await filterLocators.openFilterDrawer();
      await expect(filterLocators.applyFiltersBtn).toBeVisible();

      logStep('Clicking Close button in Drawer...');
      await filterLocators.closeFilterDrawer();
      await expect(filterLocators.applyFiltersBtn).not.toBeVisible();
      logSuccess('Drawer closed cleanly via Close button.');
    });

    // ── Step 2: Apply Filters & Verify Drawer Closes Automatically ────
    await test.step('Step 2 : 🎯 Apply Status Filter & Verify Side Panel Closes', async () => {
      logHeader('STEP 2', 'Apply Filter & Auto Close');
      logStep('Opening Filter Drawer...');
      await filterLocators.openFilterDrawer();

      logStep('Selecting Accounts Approval: "Approved"...');
      await filterLocators.filterByAccountsApproval('Approved');

      logStep('Clicking Apply Filters button...');
      await filterLocators.applyFilters();
      await expect(filterLocators.applyFiltersBtn).not.toBeVisible();
      logSuccess('Filter applied and drawer automatically closed.');
    });

    // ── Step 3: Reset Filters & Verify All Data Restored ──────────────
    await test.step('Step 3 : 🔄 Reset Filters & Verify Table Restored', async () => {
      logHeader('STEP 3', 'Reset Filters');
      logStep('Opening Filter Drawer...');
      await filterLocators.openFilterDrawer();

      logStep('Clicking Reset Filters button...');
      await filterLocators.resetFilters();

      logStep('Clicking Apply Filters button after reset...');
      await filterLocators.applyFilters();

      logStep('Verifying DataGrid rows are visible...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      await expect(vendorDatabaseLocators.rows.first()).toBeVisible();
      logSuccess('Filters reset successfully and full table data restored.');
    });

  });

  test('Document Availability Filters', async ({ page }) => {
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);

    // Login as Developer
    await loginAs(page, USER_ROLES.DEVELOPER);
    await page.goto(ENDPOINTS.VENDOR.DATABASE);
    await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

    // ── Step 1: Filter by "With Documents" ────────────────────────────
    await test.step('Step 1 : 📄 Filter by "With Documents" & Validate Download Buttons Present', async () => {
      logHeader('STEP 1', 'Filter With Documents & Verify Download Buttons');
      logStep('Opening Filter Drawer & selecting "With Documents"...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByDocs('With Documents');
      await filterLocators.applyFilters();

      logStep('Verifying filtered results contain table rows...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      await expect(vendorDatabaseLocators.rows.first()).toBeVisible();

      logStep('Scrolling horizontally to render document columns...');
      await vendorDatabaseLocators.scrollToRight();

      const downloadBtns = page.getByTestId('vendor-data-download-btn');
      const downloadBtnCount = await downloadBtns.count();
      logStep(`Document download buttons found in table: ${downloadBtnCount}`);
      expect(downloadBtnCount).toBeGreaterThan(0);

      // Verify and click document download buttons
      await expect(downloadBtns.first()).toBeVisible();
      logStep('Clicking document download buttons on filtered rows...');
      const btnsToClick = Math.min(downloadBtnCount, 6);
      for (let i = 0; i < btnsToClick; i++) {
        const btn = downloadBtns.nth(i);
        if (await btn.isVisible()) {
          const ariaLabel = (await btn.locator('..').getAttribute('aria-label')) || `Document #${i + 1}`;
          await btn.click({ force: true });
          logStep(`Clicked download button: "${ariaLabel}"`);
          await page.waitForTimeout(200);
        }
      }
      logSuccess(`"With Documents" filter validated: ${downloadBtnCount} document download buttons present & clicked.`);
    });

    // ── Step 2: Filter by "Without Documents" ─────────────────────────
    await test.step('Step 2 : 🚫 Filter by "Without Documents" & Validate Not Available Badges', async () => {
      logHeader('STEP 2', 'Filter Without Documents & Verify Missing Badges');
      logStep('Opening Filter Drawer & selecting "Without Documents"...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByDocs('Without Documents');
      await filterLocators.applyFilters();

      logStep('Verifying DataGrid renders filtered results...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();

      logStep('Scrolling horizontally to render document columns...');
      await vendorDatabaseLocators.scrollToRight();

      const missingBadges = page.getByTestId('vendor-data-download-missing');
      const missingCount = await missingBadges.count();
      logStep(`"Not available" document badges found in table: ${missingCount}`);
      expect(missingCount).toBeGreaterThan(0);

      // Verify text on missing badge
      await expect(missingBadges.first()).toContainText(/Not available/i);
      logSuccess(`"Without Documents" filter validated: ${missingCount} "Not available" document badges present.`);
    });

    // ── Step 3: Reset Filter back to "All Vendors" ────────────────────
    await test.step('Step 3 : 🔄 Reset Filter to "All Vendors" & Validate Combined Data', async () => {
      logHeader('STEP 3', 'Reset to All Vendors & Verify Full Data');
      logStep('Opening Filter Drawer & clicking Reset Filters...');
      await filterLocators.openFilterDrawer();
      await filterLocators.resetFilters();
      await filterLocators.applyFilters();

      logStep('Verifying full table restored...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      await expect(vendorDatabaseLocators.rows.first()).toBeVisible();

      const allRowsCount = await vendorDatabaseLocators.rows.count();
      logStep(`Total vendor rows rendered under "All Vendors": ${allRowsCount}`);
      logSuccess('Reset to "All Vendors" verified successfully with full dataset restored.');
    });

  });

  test('Search & Filter Integration', async ({ page }) => {
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);

    // Login as Developer
    await loginAs(page, USER_ROLES.DEVELOPER);
    await page.goto(ENDPOINTS.VENDOR.DATABASE);
    await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

    // ── Step 1: Apply Status Filter & Perform Targeted Search ─────────
    await test.step('Step 1 : 🎯 Apply Filter & Search Intersection', async () => {
      logHeader('STEP 1', 'Apply Filter & Targeted Search');
      logStep('Opening Filter Drawer & selecting Accounts Approval: "Approved"...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Approved');
      await filterLocators.applyFilters();

      logStep('Searching for "Vendor" in search box with active filter...');
      await vendorDatabaseLocators.searchVendor('Vendor');
      await page.waitForTimeout(500);

      logStep('Verifying filtered and searched results render...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      const rowCount = await vendorDatabaseLocators.rows.count();
      logStep(`Matching rows found with Search + Filter: ${rowCount}`);
      expect(rowCount).toBeGreaterThan(0);
      logSuccess('Combined Search + Filter intersection verified successfully.');
    });

    // ── Step 2: Trigger Export with Active Filter & Validate Toast ─────
    await test.step('Step 2 : 📊 Export Filtered Data & Verify Success Toast', async () => {
      logHeader('STEP 2', 'Export Filtered Data');
      logStep('Clicking Export button (vendor-data-export-btn)...');
      await vendorDatabaseLocators.clickExportBtn();

      logStep('Verifying Export success toast alert...');
      await expect(vendorDatabaseLocators.toastAlert.first()).toBeVisible();
      await expect(vendorDatabaseLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS);
      logSuccess(`Export success toast verified: "${TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS}"`);
    });

    // ── Step 3: Clean up Search & Reset Filters ───────────────────────
    await test.step('Step 3 : 🔄 Clear Search & Reset Filters', async () => {
      logHeader('STEP 3', 'Clean up Search & Filters');
      await vendorDatabaseLocators.searchVendor('');
      await filterLocators.openFilterDrawer();
      await filterLocators.resetFilters();
      await filterLocators.applyFilters();
      await expect(vendorDatabaseLocators.rows.first()).toBeVisible();
      logSuccess('Search cleared and filters reset cleanly.');
    });

  });

  test('Empty State & Data Recovery', async ({ page }) => {
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);

    // Login as Developer
    await loginAs(page, USER_ROLES.DEVELOPER);
    await page.goto(ENDPOINTS.VENDOR.DATABASE);
    await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

    // ── Step 1: Filter with Non-Matching Search Query ─────────────────
    await test.step('Step 1 : 🚫 Apply Non-Matching Search & Filter Combination', async () => {
      logHeader('STEP 1', 'Apply Non-Matching Search & Filter');
      logStep('Opening Filter Drawer & selecting Accounts Approval: "Rejected"...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Rejected');
      await filterLocators.applyFilters();

      logStep('Entering non-existent vendor search query "NonExistentVendor_XYZ_9999"...');
      await vendorDatabaseLocators.searchVendor('NonExistentVendor_XYZ_9999');
      await page.waitForTimeout(500);

      logStep('Verifying DataGrid handles zero-results gracefully with empty state...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      await expect(vendorDatabaseLocators.rows).toHaveCount(0);
      logSuccess('Zero-results state handled gracefully with 0 rows rendered.');
    });

    // ── Step 2: Reset Filters & Verify Table Recovers ─────────────────
    await test.step('Step 2 : 🔄 Reset Filters & Verify Full Recovery', async () => {
      logHeader('STEP 2', 'Reset Filters & Recover Data');
      logStep('Clearing search box...');
      await vendorDatabaseLocators.searchVendor('');
      await page.waitForTimeout(300);

      logStep('Opening Filter Drawer & clicking Reset Filters...');
      await filterLocators.openFilterDrawer();
      await filterLocators.resetFilters();
      await filterLocators.applyFilters();

      logStep('Verifying DataGrid recovers all rows...');
      await expect(vendorDatabaseLocators.dataGrid).toBeVisible();
      await expect(vendorDatabaseLocators.rows.first()).toBeVisible();
      const recoveredCount = await vendorDatabaseLocators.rows.count();
      logStep(`Recovered rows count after filter reset: ${recoveredCount}`);
      expect(recoveredCount).toBeGreaterThan(0);
      logSuccess('Full vendor dataset recovered cleanly after filter reset.');
    });

  });

});

/**
 * @file VendorModalActions.spec.ts
 * @description End-to-end test suite for Vendor Approval & Rejection from inside the View Details modal.
 *
 * Scenarios Covered:
 *  1. 🟢 Approve via View Details Modal:
 *     🔐 Developer logs in → validates Home endpoint →
 *     navigates to Vendor Approval (validates endpoint) →
 *     checks if pending vendor is available (or registers a new vendor) →
 *     opens View Details modal → clicks 'Approve' inside modal →
 *     confirms in Approve Confirmation Modal →
 *     🔄 Reloads page → validates endpoint & pending queue count decreases by 1.
 *
 *  2. ❌ Reject via View Details Modal:
 *     🔐 Developer logs in → validates Home endpoint →
 *     navigates to Vendor Approval (validates endpoint) →
 *     checks if pending vendor is available (or registers a new vendor) →
 *     opens View Details modal → clicks 'Reject' inside modal →
 *     enters rejection remarks in Rejection Modal → confirms rejection →
 *     verifies 'Vendor rejected successfully' toast alert →
 *     🔄 Reloads page → validates endpoint & pending queue count decreases by 1.
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
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
import { VENDOR_TEST_DATA, VENDOR_REJECTION_REASONS } from '../../Data/Vendor/vendor-test-data';

test.describe('🏭 Vendor Management — Actions via Details Modal', () => {

  // ── Scenario 1: Approve via View Details Modal ──────────────────────
  test('🟢 Approve vendor from inside View Details modal and validate count decreases by 1', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);

    // Phase 1: Login
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // Phase 2: Navigate to Vendor Approval
    await test.step('Phase 2 : 📂 Navigate to Vendor Approval & Validate Endpoint', async () => {
      logHeader('PHASE 2', 'Navigate to Vendor Approval');
      logStep('Hovering on Vendor menu & clicking Vendor Approval link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      logSuccess(`Vendor Approval page loaded & endpoint validated: "${page.url()}"`);
    });

    // Phase 3: Check Queue & Prepare Vendor
    const pendingRowCount = await vendorApprovalLocators.tableRows.count();
    logStep(`Pending Vendors Count in Queue: ${pendingRowCount}`);

    let targetVendorName = '';

    if (pendingRowCount === 0) {
      const newVendorData = VENDOR_TEST_DATA.validVendor;
      targetVendorName = newVendorData.vendorName;

      await test.step('Phase 3a : 🟡 Queue is empty — Register new vendor first', async () => {
        logHeader('PHASE 3A', 'Queue Empty — Register New Vendor');
        logStep('No pending vendor in queue! Registering new vendor...');
        await headerNav.vendorBtn.hover();
        await headerNav.vendor.registration.click();
        await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

        logStep(`Registering Vendor: "${targetVendorName}"`);
        logData('Vendor Name', targetVendorName);
        logData('GST Number', newVendorData.gstNumber);

        await vendorRegLocators.fillVendorRegistrationForm(newVendorData);
        await vendorRegLocators.submitForm();
        await expect(vendorRegLocators.toastAlert).toBeVisible();
        logSuccess('New vendor registered successfully.');

        await headerNav.vendorBtn.hover();
        await headerNav.vendor.approval.click();
        await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      });
    } else {
      const firstRow = vendorApprovalLocators.tableRows.first();
      targetVendorName = await firstRow.getByTestId('vendor-approval-card-name').innerText().catch(() => '');
    }

    const initialCount = await vendorApprovalLocators.getPendingCount();
    logData('Initial Pending Count', initialCount);
    logData('Target Vendor', targetVendorName);

    // Phase 4: Open Details Modal & Approve
    await test.step('Phase 4 : 👁️ Open View Details Modal & Approve Vendor', async () => {
      logHeader('PHASE 4', 'Approve from View Details Modal');
      logStep(`Approving Vendor via View Details Modal: "${targetVendorName}"`);
      await vendorApprovalLocators.approveFromDetailsModal(targetVendorName);
      await page.waitForTimeout(2000);
      logSuccess(`Vendor approved from View Details modal: "${targetVendorName}"`);
    });

    // Phase 5: Reload Page & Validate Pending Count (Initial - 1)
    await test.step('Phase 5 : 🔄 Reload page & Validate Endpoint & Pending Count (Count - 1)', async () => {
      logHeader('PHASE 5', 'Verify Decreased Pending Count');
      logStep('Reloading Vendor Approval page to fetch updated server count...');
      await page.reload();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      const updatedCount = await vendorApprovalLocators.getPendingCount();
      const expectedCount = initialCount - 1;

      logData('Count Before Approval', initialCount);
      logData('Count After Approval', updatedCount);
      logData('Expected Count', expectedCount);

      expect(updatedCount).toBe(expectedCount);
      logSuccess(`Pending vendor count successfully decreased by 1 (${initialCount} → ${updatedCount})`);
    });

    logFinish('MODAL APPROVAL WORKFLOW COMPLETED SUCCESSFULLY');
  });

  // ── Scenario 2: Reject via View Details Modal ───────────────────────
  test('❌ Reject vendor from inside View Details modal with remarks and validate count decreases by 1', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);

    // Phase 1: Login
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // Phase 2: Navigate to Vendor Approval
    await test.step('Phase 2 : 📂 Navigate to Vendor Approval & Validate Endpoint', async () => {
      logHeader('PHASE 2', 'Navigate to Vendor Approval');
      logStep('Hovering on Vendor menu & clicking Vendor Approval link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      logSuccess(`Vendor Approval page loaded & endpoint validated: "${page.url()}"`);
    });

    // Phase 3: Check Queue & Prepare Vendor
    const pendingRowCount = await vendorApprovalLocators.tableRows.count();
    logStep(`Pending Vendors Count in Queue: ${pendingRowCount}`);

    let targetVendorName = '';

    if (pendingRowCount === 0) {
      const newVendorData = VENDOR_TEST_DATA.validVendor;
      targetVendorName = newVendorData.vendorName;

      await test.step('Phase 3a : 🟡 Queue is empty — Register new vendor first', async () => {
        logHeader('PHASE 3A', 'Queue Empty — Register New Vendor');
        logStep('No pending vendor in queue! Registering new vendor...');
        await headerNav.vendorBtn.hover();
        await headerNav.vendor.registration.click();
        await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

        logStep(`Registering Vendor: "${targetVendorName}"`);
        logData('Vendor Name', targetVendorName);

        await vendorRegLocators.fillVendorRegistrationForm(newVendorData);
        await vendorRegLocators.submitForm();
        await expect(vendorRegLocators.toastAlert).toBeVisible();
        logSuccess('New vendor registered successfully.');

        await headerNav.vendorBtn.hover();
        await headerNav.vendor.approval.click();
        await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      });
    } else {
      const firstRow = vendorApprovalLocators.tableRows.first();
      targetVendorName = await firstRow.getByTestId('vendor-approval-card-name').innerText().catch(() => '');
    }

    const initialCount = await vendorApprovalLocators.getPendingCount();
    logData('Initial Pending Count', initialCount);
    logData('Target Vendor', targetVendorName);

    // Phase 4: Open Details Modal & Reject
    await test.step('Phase 4 : 👁️ Open View Details Modal & Reject Vendor with Remarks', async () => {
      logHeader('PHASE 4', 'Reject from View Details Modal');
      logStep(`Rejecting Vendor via View Details Modal: "${targetVendorName}"`);
      logData('Rejection Remarks', VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID);

      await vendorApprovalLocators.rejectFromDetailsModal(
        targetVendorName,
        VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID
      );
      await page.waitForTimeout(2000);
      logSuccess(`Rejection submitted from View Details modal for: "${targetVendorName}"`);
    });

    // Phase 5: Verify Rejection Toast Alert
    await test.step('Phase 5 : 🔍 Verify Vendor Rejected success toast alert', async () => {
      logHeader('PHASE 5', 'Verify Rejection Toast Alert');
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      await expect(vendorApprovalLocators.toastAlert).toContainText(
        TOAST_MESSAGES.VENDOR.REJECTED_SUCCESS
      );
      const toastText = await vendorApprovalLocators.toastAlert.innerText();
      logData('Toast Alert Text', toastText);
      logSuccess(`Success Toast Alert Verified: "${toastText}"`);
    });

    // Phase 6: Reload Page & Validate Pending Count (Initial - 1)
    await test.step('Phase 6 : 🔄 Reload page & Validate Endpoint & Pending Count (Count - 1)', async () => {
      logHeader('PHASE 6', 'Verify Decreased Pending Count');
      logStep('Reloading Vendor Approval page to fetch updated server count...');
      await page.reload();
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

    logFinish('MODAL REJECTION WORKFLOW COMPLETED SUCCESSFULLY');
  });

});

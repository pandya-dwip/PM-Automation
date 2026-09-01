/**
 * @file VendorEdit.spec.ts
 * @description End-to-end test for Vendor Information Edit, Search Edge-Cases & Cancel/Discard workflow.
 *
 * Scenarios Covered:
 *  1. ✏️ Edit vendor details, strictly verify persisted data in Edit modal & validate updated data on Vendor Approval page
 *  2. 🔍 Search Edge-Cases: Non-existent query empty state, search by Partial Vendor Name, and search input clearing
 *  3. 🚫 Cancel Edit Form: Modify fields in Edit modal, click Cancel button, re-open modal & verify original values persist without unsaved changes
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - pages/Vendor/vendorEdit.locators.ts           → VendorEditLocators
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
import { VendorEditLocators } from '../../pages/Vendor/vendorEdit.locators';
import { VENDOR_TEST_DATA } from '../../Data/Vendor/vendor-test-data';

test.describe('🏭 Vendor Management — Edit & Search Workflows', () => {

  // ── Scenario 1: Edit Vendor & Cross-Page Verification ──────────────
  test('✏️ Edit vendor details, strictly verify persisted data in Edit modal & validate updated data on Vendor Approval page', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorEditLocators = new VendorEditLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);

    const initialVendorData = VENDOR_TEST_DATA.validVendor;
    const updatedVendorData = VENDOR_TEST_DATA.editVendor;

    // Phase 1: Login
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // Phase 2: Register New Vendor Dynamically
    await test.step('Phase 2 : 📝 Register a new vendor for editing', async () => {
      logHeader('PHASE 2', 'Register Vendor for Editing');
      logStep('Navigating to Vendor Registration...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Submitting Registration Data for: "${initialVendorData.vendorName}"`);
      logData('Vendor Name', initialVendorData.vendorName);
      logData('Contact Person', initialVendorData.contactPerson);
      logData('GST Number', initialVendorData.gstNumber);

      await vendorRegLocators.fillVendorRegistrationForm(initialVendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      logSuccess('Vendor registered successfully.');
    });

    // Phase 3: Navigate to Vendor Edit
    await test.step('Phase 3 : 📂 Navigate to Vendor Edit page & Validate Endpoint', async () => {
      logHeader('PHASE 3', 'Navigate to Vendor Edit Page');
      logStep('Navigating to Vendor Edit page...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.edit.click();

      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);
      await expect(vendorEditLocators.pageHeading).toBeVisible();

      logStep('Reloading Vendor Edit page to fetch fresh server list...');
      await page.reload();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);
      await page.waitForTimeout(1000);
      logSuccess(`Vendor Edit page loaded & endpoint validated: "${page.url()}"`);
    });

    // Phase 4: Search Registered Vendor
    await test.step('Phase 4 : 🔍 Search for registered vendor & verify card details', async () => {
      logHeader('PHASE 4', 'Search Vendor on Edit Page');
      logStep(`Searching for vendor: "${initialVendorData.vendorName}"`);
      await vendorEditLocators.searchVendor(initialVendorData.vendorName);

      const vendorCard = vendorEditLocators.getVendorCard(initialVendorData.vendorName);
      await expect(vendorCard.card).toBeVisible();
      logStep('Verifying vendor card details in search results:');
      const cardName = await vendorCard.name.innerText();
      logData('Card Vendor Name', cardName);
      expect(cardName.toUpperCase()).toBe(initialVendorData.vendorName.toUpperCase());
      logSuccess('Vendor card details verified successfully.');
    });

    // Phase 5: Open Edit Modal & Modify Details
    await test.step('Phase 5 : ✏️ Open Edit modal, update vendor fields & submit', async () => {
      logHeader('PHASE 5', 'Open Edit Modal & Update Vendor Details');
      logStep('Opening Edit modal for registered vendor...');
      await vendorEditLocators.openEditModal(initialVendorData.vendorName);
      await expect(vendorEditLocators.editDialog).toBeVisible();
      logSuccess('Edit Vendor Details modal opened.');

      logStep('Updating fields in Edit modal:');
      logData('New Vendor Name', updatedVendorData.vendorName);
      logData('New Contact Person', updatedVendorData.contactPerson);
      logData('New Mobile 1', updatedVendorData.mobile1);
      logData('New Email', updatedVendorData.primaryEmail);
      logData('New State', updatedVendorData.state);

      await vendorEditLocators.updateVendorForm(updatedVendorData);
      await vendorEditLocators.submitEditForm();

      await expect(vendorEditLocators.toastAlert).toBeVisible();
      await expect(vendorEditLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.EDITED_SUCCESS);
      logSuccess('Vendor details updated successfully.');
    });

    // Phase 6: Verify Updates on Vendor Edit Page
    await test.step('Phase 6 : 🔍 Re-search updated vendor on Edit page & verify persistence in Edit modal', async () => {
      logHeader('PHASE 6', 'Verify Persistence in Edit Modal');
      logStep(`Searching for updated vendor: "${updatedVendorData.vendorName}"`);
      await page.reload();
      await vendorEditLocators.searchVendor(updatedVendorData.vendorName);

      const updatedCard = vendorEditLocators.getVendorCard(updatedVendorData.vendorName);
      await expect(updatedCard.card).toBeVisible();

      logStep('Re-opening Edit modal to verify persisted values...');
      await vendorEditLocators.openEditModal(updatedVendorData.vendorName);
      await expect(vendorEditLocators.editDialog).toBeVisible();

      const modalValues = await vendorEditLocators.getEditFormValues();
      logData('Modal Vendor Name', modalValues.vendorName);
      logData('Modal Contact Person', modalValues.contactPerson);
      logData('Modal Mobile 1', modalValues.mobile1);

      expect(modalValues.vendorName.toUpperCase()).toBe(updatedVendorData.vendorName.toUpperCase());
      expect(modalValues.contactPerson).toBe(updatedVendorData.contactPerson);
      expect(modalValues.mobile1).toBe(updatedVendorData.mobile1);

      await vendorEditLocators.dialogCloseBtn.click();
      await expect(vendorEditLocators.editDialog).not.toBeVisible();
      logSuccess('Updated data verified successfully inside Edit modal.');
    });

    // Phase 7: Cross-Page Verification on Vendor Approval Page
    await test.step('Phase 7 : 🔍 Cross-page verification of updated vendor details on Vendor Approval page', async () => {
      logHeader('PHASE 7', 'Cross-Page Verification on Vendor Approval Page');
      logStep('Navigating to Vendor Approval page...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      logStep(`Searching for updated vendor: "${updatedVendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(updatedVendorData.vendorName);

      const updatedApprovalRow = vendorApprovalLocators.getVendorRow(updatedVendorData.vendorName);
      await expect(updatedApprovalRow.row).toBeVisible();

      const rowName = await updatedApprovalRow.name.innerText();
      logData('Approval Row Vendor Name', rowName);
      expect(rowName.toUpperCase()).toBe(updatedVendorData.vendorName.toUpperCase());

      await updatedApprovalRow.viewBtn.click();
      await expect(vendorApprovalLocators.detailsModal).toBeVisible();
      const modalContact = await vendorApprovalLocators.detailsContactPerson.innerText();
      logData('Approval Modal Contact Person', modalContact);
      expect(modalContact).toBe(updatedVendorData.contactPerson);
      await vendorApprovalLocators.detailsCloseBtn.click();
      logSuccess('Updated vendor data verified on Vendor Approval page!');
    });

    logFinish('VENDOR EDIT & CROSS-PAGE VERIFICATION COMPLETED SUCCESSFULLY');
  });

  // ── Scenario 2: Search Edge-Cases ────────────────────────────────────
  test('🔍 Search Edge-Cases: Non-existent query empty state, Partial name search & search input clearing', async ({ page }) => {
    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorEditLocators = new VendorEditLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // Phase 1: Login & Register Vendor
    await test.step('Phase 1 : 🔐 Login & Register Vendor for Search Tests', async () => {
      logHeader('PHASE 1', 'Login & Register Vendor for Search Tests');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Registration...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Registering vendor: "${vendorData.vendorName}"`);
      await vendorRegLocators.fillVendorRegistrationForm(vendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      logSuccess('Vendor registered successfully.');
    });

    // Phase 2: Navigate to Vendor Edit
    await test.step('Phase 2 : 📂 Navigate to Vendor Edit page', async () => {
      logHeader('PHASE 2', 'Navigate to Vendor Edit');
      logStep('Navigating to Vendor Edit page (/vendor-edit)...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.edit.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);

      logStep('Reloading page to fetch fresh server list...');
      await page.reload();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);
      await page.waitForTimeout(1000);
      logSuccess('Vendor Edit page loaded.');
    });

    // Phase 3: Non-Existent Query Search -> Verify Empty State
    await test.step('Phase 3 : ⚠️ Search by non-existent query & verify empty state message', async () => {
      logHeader('PHASE 3', 'Non-Existent Query Search & Empty State Verification');
      const nonExistentQuery = 'NON_EXISTENT_VENDOR_QUERY_XYZ_9999';
      logStep(`Searching for non-existent query: "${nonExistentQuery}"`);
      await vendorEditLocators.searchVendor(nonExistentQuery);

      const invalidCard = vendorEditLocators.getVendorCard(nonExistentQuery);
      logStep('Verifying non-existent vendor card is NOT visible...');
      await expect(invalidCard.card).not.toBeVisible();

      logStep('Verifying empty state message ("No vendors match your search") is displayed...');
      await expect(vendorEditLocators.emptyStateMessage).toBeVisible();
      logSuccess('Empty state message verified for non-existent search query.');
    });

    // Phase 4: Search by Partial Vendor Name
    await test.step('Phase 4 : 🔍 Search by Partial Vendor Name & verify card matching', async () => {
      logHeader('PHASE 4', 'Search by Partial Vendor Name');
      const partialName = vendorData.vendorName.substring(0, 15);
      logStep(`Searching by Partial Vendor Name: "${partialName}"`);
      await vendorEditLocators.searchVendor(partialName);

      const partialCard = vendorEditLocators.getVendorCard(vendorData.vendorName);
      logStep('Verifying matching vendor card is visible...');
      await expect(partialCard.card).toBeVisible();
      logSuccess(`Vendor card located via partial name search: "${partialName}"`);
    });

    // Phase 5: Clear Search Input & Verify List Restoration
    await test.step('Phase 5 : 🔄 Clear search input & verify vendor cards restore', async () => {
      logHeader('PHASE 5', 'Clear Search & List Restoration');
      logStep('Clearing search input...');
      await vendorEditLocators.searchVendor('');
      await page.waitForTimeout(500);

      logStep('Verifying vendor cards restore automatically...');
      await expect(vendorEditLocators.vendorCards.first()).toBeVisible();
      logSuccess('Search input cleared & full vendor list restored.');
    });

    logFinish('SEARCH EDGE-CASES & EMPTY STATE VALIDATION COMPLETED SUCCESSFULLY');
  });

  // ── Scenario 3: Cancel/Discard Edit Form ─────────────────────────────
  test('🚫 Cancel Edit Form: Modify fields in Edit modal, click Cancel, re-open modal & verify original values persist', async ({ page }) => {
    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorEditLocators = new VendorEditLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // Phase 1: Login & Register Vendor
    await test.step('Phase 1 : 🔐 Login & Register Vendor for Cancel Edit Testing', async () => {
      logHeader('PHASE 1', 'Login & Register Vendor for Cancel Testing');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Registration...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Registering vendor: "${vendorData.vendorName}"`);
      await vendorRegLocators.fillVendorRegistrationForm(vendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      logSuccess('Vendor registered successfully.');
    });

    // Phase 2: Navigate to Vendor Edit & Open Modal
    await test.step('Phase 2 : 📂 Navigate to Vendor Edit & Open Edit Modal', async () => {
      logHeader('PHASE 2', 'Navigate & Open Edit Modal');
      logStep('Navigating to Vendor Edit page (/vendor-edit)...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.edit.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);

      logStep('Reloading page to fetch fresh server list...');
      await page.reload();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.EDIT);
      await page.waitForTimeout(1000);

      logStep(`Searching for vendor: "${vendorData.vendorName}"`);
      await vendorEditLocators.searchVendor(vendorData.vendorName);

      logStep('Clicking "Edit Vendor" button...');
      await vendorEditLocators.openEditModal(vendorData.vendorName);
      await expect(vendorEditLocators.editDialog).toBeVisible();
      logSuccess('Edit Vendor Details modal dialog opened.');
    });

    // Phase 3: Modify Inputs & Click Cancel Button
    await test.step('Phase 3 : ✏️ Modify form fields and click Cancel button', async () => {
      logHeader('PHASE 3', 'Modify Fields & Click Cancel');
      logStep('Modifying Vendor Name input to "UNSAVED CANCELLED NAME"...');
      await vendorEditLocators.vendorNameInput.fill('UNSAVED CANCELLED NAME');

      logStep('Modifying Contact Person input to "UNSAVED CANCELLED PERSON"...');
      await vendorEditLocators.contactPersonInput.fill('UNSAVED CANCELLED PERSON');

      logStep('Clicking "Cancel" button on Edit modal...');
      await vendorEditLocators.cancelBtn.click();

      logStep('Verifying Edit Vendor Details modal dialog is closed...');
      await expect(vendorEditLocators.editDialog).not.toBeVisible();
      logSuccess('Edit modal closed via Cancel button.');
    });

    // Phase 4: Re-open Modal & Verify Unsaved Modifications Were Discarded
    await test.step('Phase 4 : 🔍 Re-open Edit modal & strictly verify original unedited data persists', async () => {
      logHeader('PHASE 4', 'Verify Discarded Modifications on Re-Open');
      logStep(`Re-searching for original vendor name: "${vendorData.vendorName}"`);
      await vendorEditLocators.searchVendor(vendorData.vendorName);

      logStep('Re-opening Edit Vendor modal...');
      await vendorEditLocators.openEditModal(vendorData.vendorName);
      await expect(vendorEditLocators.editDialog).toBeVisible();

      logStep('Reading current form values in Edit modal:');
      const currentValues = await vendorEditLocators.getEditFormValues();
      logData('Form Vendor Name', currentValues.vendorName);
      logData('Form Contact Person', currentValues.contactPerson);

      logStep('Asserting form values strictly match original unedited data...');
      expect(currentValues.vendorName.toUpperCase()).toBe(vendorData.vendorName.toUpperCase());
      expect(currentValues.contactPerson).toBe(vendorData.contactPerson);
      logSuccess('Original pre-filled values strictly persisted! Unsaved edits were cleanly discarded.');

      await vendorEditLocators.dialogCloseBtn.click();
      await expect(vendorEditLocators.editDialog).not.toBeVisible();
      logSuccess('Edit modal dialog closed.');
    });

    logFinish('CANCEL EDIT FORM & DISCARD BEHAVIOR VERIFIED SUCCESSFULLY');
  });

});

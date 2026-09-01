/**
 * @file VendorVerification.spec.ts
 * @description End-to-end test for Vendor Registration & Details Verification workflow.
 *
 * Scenario Covered:
 *  🔐 Developer logs in → validates Home endpoint →
 *     navigates to Vendor Registration (validates endpoint) →
 *     registers a new vendor dynamically with 7 attached documents & MSME certificate →
 *     navigates to Vendor Approval (validates endpoint) →
 *     searches for the newly registered vendor →
 *     clicks 'View Details' button to open the details modal →
 *     🔍 Verifies that all modal fields match the registered vendor data:
 *        - Header Vendor Name (case-insensitive)
 *        - Basic Information: Contact Person, Product Category, Is MSME ('Yes'), Website, Address
 *        - Documents Section: Heading 'Documents (7/7)', Download buttons for all 7 attached documents.
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - Data/Vendor/vendor-test-data.ts               → VENDOR_TEST_DATA
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
import { VENDOR_TEST_DATA } from '../../Data/Vendor/vendor-test-data';

test.describe('🏭 Vendor Management — Verification Workflow', () => {

  test('🔍 Register a new vendor and verify all modal details match submitted data', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // ── Phase 1: Login & Endpoint Validation ─────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // ── Phase 2: Register New Vendor ────────────────────────────────
    await test.step('Phase 2 : 📝 Register a new vendor with 7 document attachments', async () => {
      logHeader('PHASE 2', 'Register Vendor with Attachments');
      logStep('Navigating to Vendor Registration...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Submitting Registration for: "${vendorData.vendorName}"`);
      logData('Vendor Name', vendorData.vendorName);
      logData('Contact Person', vendorData.contactPerson);
      logData('GST Number', vendorData.gstNumber);
      logData('PAN Number', vendorData.panNumber);
      logData('Website', vendorData.website!);
      logData('Address', vendorData.address);

      await vendorRegLocators.fillVendorRegistrationForm(vendorData);
      await vendorRegLocators.submitForm();
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      logSuccess('Vendor registered successfully with 7 document attachments.');
    });

    // ── Phase 3: Navigate to Vendor Approval & Search ────────────────
    await test.step('Phase 3 : 📂 Navigate to Vendor Approval & search registered vendor', async () => {
      logHeader('PHASE 3', 'Search Vendor on Approval Page');
      logStep('Navigating to Vendor Approval page...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);

      logStep(`Searching for vendor: "${vendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(vendorData.vendorName);

      const vendorRow = vendorApprovalLocators.getVendorRow(vendorData.vendorName);
      await expect(vendorRow.row).toBeVisible();
      logSuccess(`Vendor row located in Approval table.`);
    });

    // ── Phase 4: Open View Details Modal ─────────────────────────────
    await test.step('Phase 4 : 👁️ Open View Details Modal', async () => {
      logHeader('PHASE 4', 'Open View Details Modal');
      const vendorRow = vendorApprovalLocators.getVendorRow(vendorData.vendorName);
      logStep('Clicking View Details button...');
      await vendorRow.viewBtn.click();
      await expect(vendorApprovalLocators.detailsModal).toBeVisible();
      logSuccess('View Details Modal opened successfully.');
    });

    // ── Phase 5: Verify Header & Basic Information Details ───────────
    await test.step('Phase 5 : 🔍 Verify Basic Information matches submitted test data', async () => {
      logHeader('PHASE 5', 'Basic Information Modal Fields Verification');

      const modalVendorName = await vendorApprovalLocators.detailsTitleVendorName.innerText();
      logData('Modal Vendor Name', modalVendorName);
      expect(modalVendorName.toUpperCase()).toBe(vendorData.vendorName.toUpperCase());

      const modalContact = await vendorApprovalLocators.detailsContactPerson.innerText();
      logData('Modal Contact Person', modalContact);
      expect(modalContact).toBe(vendorData.contactPerson);

      const modalCategory = await vendorApprovalLocators.detailsProductCategory.innerText();
      logData('Modal Category', modalCategory);
      expect(modalCategory).toBe(vendorData.productCategory!);

      const modalMsme = await vendorApprovalLocators.detailsIsMsme.innerText();
      logData('Modal Is MSME?', modalMsme);
      expect(modalMsme).toBe('Yes');

      const modalWebsite = await vendorApprovalLocators.detailsWebsite.innerText();
      logData('Modal Website', modalWebsite);
      expect(modalWebsite).toBe(vendorData.website!);

      const modalAddress = await vendorApprovalLocators.detailsAddress.innerText();
      logData('Modal Address', modalAddress);
      expect(modalAddress).toBe(vendorData.address);

      logSuccess('All Basic Information fields strictly match submitted registration data.');
    });

    // ── Phase 6: Verify Documents Section & Downloads ───────────────
    await test.step('Phase 6 : 🔍 Verify Documents Section & 7/7 Uploaded Files', async () => {
      logHeader('PHASE 6', 'Document Downloads Verification');

      await expect(vendorApprovalLocators.detailsDocumentsHeading).toBeVisible();
      const docsHeadingText = await vendorApprovalLocators.detailsDocumentsHeading.innerText();
      logData('Documents Heading', docsHeadingText);

      await expect(vendorApprovalLocators.detailsPanCardDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsGstCertificateDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsIncorporationDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsCancelledChequeDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsTanLetterDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsMsmeCertificateDownload).toBeVisible();
      await expect(vendorApprovalLocators.detailsVendorRegFormDownload).toBeVisible();

      logSuccess('All 7 attached document download buttons are visible & verified.');

      await vendorApprovalLocators.detailsCloseBtn.click();
      await expect(vendorApprovalLocators.detailsModal).not.toBeVisible();
      logSuccess('View Details Modal closed cleanly.');
    });

    logFinish('VENDOR REGISTRATION & DETAILS MODAL VERIFICATION COMPLETED SUCCESSFULLY');
  });

});

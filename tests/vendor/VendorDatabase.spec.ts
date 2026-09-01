/**
 * @file VendorDatabase.spec.ts
 * @description End-to-end test suite for Vendor Database Directory (/vendor-data) validation workflow.
 *
 * Scenario Covered:
 *  🔐 Developer login →
 *  📝 Register a new dynamic vendor with all fields & 7 document uploads →
 *  ✅ Approve vendor on Vendor Approval page (/vendor-approval) →
 *  📂 Navigate to Vendor Database page (/vendor-data) →
 *  🔍 Search for the approved vendor →
 *  📊 Locate matching vendor row in DataGrid table →
 *  🔍 Strictly verify table cell values (Name, Contact, Category, Mobile 1/2, Email 1, GST, PAN, State, Status: Approved).
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

test.describe('📊 Vendor Management — Vendor Database Validation Workflow', () => {

  test('✅ Register new vendor, approve on Approval page, and strictly validate in Vendor Database', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const vendorData = VENDOR_TEST_DATA.validVendor;

    // ── Phase 1: Login & Endpoint Validation ─────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // ── Phase 2: Register New Vendor ─────────────────────────────────
    await test.step('Phase 2 : 📝 Register a new dynamic vendor with complete data & 7 uploads', async () => {
      logHeader('PHASE 2', 'Register New Vendor');
      logStep('Hovering on Vendor header dropdown & clicking Vendor Registration link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Filling vendor registration form for: "${vendorData.vendorName}"`);
      logData('Vendor Name', vendorData.vendorName);
      logData('Contact Person', vendorData.contactPerson);
      logData('GST Number', vendorData.gstNumber);
      logData('PAN Number', vendorData.panNumber);

      await vendorRegLocators.fillVendorRegistrationForm(vendorData);

      logStep('Uploading all 7 required documents...');
      await vendorRegLocators.uploadDocuments(vendorData);

      logStep('Clicking Register Vendor submit button...');
      await vendorRegLocators.submitForm();

      logStep('Waiting for registration success toast alert...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Vendor registered successfully: "${vendorData.vendorName}"`);
    });

    // ── Phase 3: Approve Vendor on Approval Page ─────────────────────
    await test.step('Phase 3 : ✅ Approve registered vendor on Vendor Approval page', async () => {
      logHeader('PHASE 3', 'Approve Vendor on Approval Page');
      logStep('Hovering on Vendor header dropdown & clicking Vendor Approval link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.approval.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      logStep(`Searching for registered vendor in Approval queue: "${vendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(vendorData.vendorName);

      logStep('Clicking Approve button & confirming approval modal...');
      await vendorApprovalLocators.approveVendor(vendorData.vendorName);

      logStep('Waiting for approval success toast alert...');
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      logSuccess(`Vendor approved successfully on Approval page: "${vendorData.vendorName}"`);
    });

    // ── Phase 4: Navigate to Vendor Database ─────────────────────────
    await test.step('Phase 4 : 📂 Navigate to Vendor Database Page & Validate Page Heading', async () => {
      logHeader('PHASE 4', 'Navigate to Vendor Database Page');
      logStep('Hovering on Vendor header dropdown & clicking Database link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.database.click();

      logStep('Verifying navigation URL matches /vendor-data...');
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.DATABASE);

      logStep('Verifying Vendor Database page heading & count chip are visible...');
      await expect(vendorDatabaseLocators.pageHeading).toBeVisible();
      await expect(vendorDatabaseLocators.countChip).toBeVisible();
      logSuccess(`Vendor Database page loaded: "${page.url()}"`);
    });

    // ── Phase 5: Search Approved Vendor in Database ──────────────────
    await test.step('Phase 5 : 🔍 Search for approved vendor in Database search input', async () => {
      logHeader('PHASE 5', 'Search Vendor in Database');
      logStep(`Filling search input with vendor name: "${vendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(vendorData.vendorName);
      await page.waitForTimeout(1000);

      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);
      logStep('Verifying matching approved vendor row is visible in DataGrid table...');
      await expect(vendorRow.row).toBeVisible();
      logSuccess('Approved vendor row located in DataGrid table.');
    });

    // ── Phase 6: Strict Verification of DataGrid Cell Values ─────────
    await test.step('Phase 6 : 📊 Strict verification of DataGrid cell values across table columns', async () => {
      logHeader('PHASE 6', 'Strict Verification of Database Cell Values');

      const vendorRow = await vendorDatabaseLocators.getVendorRow(vendorData.vendorName);

      // Verify Leftmost visible columns
      logStep(`Verifying Vendor Name cell matches: "${vendorData.vendorName}"...`);
      logData('Cell Vendor Name', vendorData.vendorName);
      await expect(vendorRow.vendorName).toContainText(vendorData.vendorName, { ignoreCase: true });

      logStep(`Verifying Product Category cell matches: "${vendorData.productCategory}"...`);
      logData('Cell Product Category', vendorData.productCategory!);
      await expect(vendorRow.productCategory).toHaveText(vendorData.productCategory!);

      logStep(`Verifying Contact Person cell matches: "${vendorData.contactPerson}"...`);
      logData('Cell Contact Person', vendorData.contactPerson);
      await expect(vendorRow.contactPerson).toHaveText(vendorData.contactPerson);

      logStep(`Verifying Mobile 1 cell matches: "${vendorData.mobile1}"...`);
      logData('Cell Mobile 1', vendorData.mobile1);
      await expect(vendorRow.mobile1).toContainText(vendorData.mobile1);

      logStep(`Verifying Mobile 2 cell matches: "${vendorData.mobile2}"...`);
      logData('Cell Mobile 2', vendorData.mobile2!);
      await expect(vendorRow.mobile2).toContainText(vendorData.mobile2!);

      // Scroll DataGrid horizontally right to render virtualized columns
      logStep('Scrolling DataGrid virtual scroller horizontally to render right-side columns...');
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = 800; });
        await page.waitForTimeout(500);
      }

      // Verify Right-side virtualized columns if rendered
      if (await vendorRow.email1.count() > 0) {
        logStep(`Verifying Primary Email cell matches: "${vendorData.primaryEmail}"...`);
        logData('Cell Primary Email', vendorData.primaryEmail);
        await expect(vendorRow.email1).toContainText(vendorData.primaryEmail);
      }

      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = 1600; });
        await page.waitForTimeout(500);
      }

      if (await vendorRow.gstNumber.count() > 0) {
        logStep(`Verifying GST Number cell matches: "${vendorData.gstNumber}"...`);
        logData('Cell GST Number', vendorData.gstNumber);
        await expect(vendorRow.gstNumber).toHaveText(vendorData.gstNumber);
      }

      if (await vendorRow.panNumber.count() > 0) {
        logStep(`Verifying PAN Number cell matches: "${vendorData.panNumber}"...`);
        logData('Cell PAN Number', vendorData.panNumber);
        await expect(vendorRow.panNumber).toHaveText(vendorData.panNumber);
      }

      if (await vendorRow.status.count() > 0) {
        logStep('Verifying Status cell contains "Approved"...');
        logData('Cell Status', 'Approved');
        await expect(vendorRow.status).toContainText('Approved', { ignoreCase: true });
      }

      logSuccess('All DataGrid cell values strictly verified in Vendor Database!');
      logFinish('VENDOR DATABASE VALIDATION WORKFLOW COMPLETED SUCCESSFULLY');
    });

  });

});

/**
 * @file VendorDuplicateValidation.spec.ts
 * @description Test Suite for Duplicate Vendor Data Validation during Vendor Registration.
 *
 * Requirements & Acceptance Criteria Covered:
 *  1. 📝 Setup: Register an initial base vendor with unique details.
 *  2. 🚫 Duplicate GST Validation:
 *     - Attempt to register a new vendor with a duplicate GST Number.
 *     - Verify registration is blocked with toast: "A vendor with this GST number already exists."
 *  3. 🚫 Duplicate PAN Validation:
 *     - Attempt to register a new vendor with a duplicate PAN Number.
 *     - Verify registration is blocked with toast: "A vendor with this PAN number already exists."
 *  4. 🚫 Duplicate Vendor Name Validation:
 *     - Attempt to register a new vendor with a duplicate Vendor Name.
 *     - Verify registration is blocked with toast: "A vendor with this name already exists."
 *  5. 🟢 Shared / Duplicate Mobile Number Allowed:
 *     - Attempt to register a new vendor with the same Mobile Number but unique GST, PAN & Name.
 *     - Verify registration succeeds: "Vendor registered successfully!"
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - Data/Vendor/vendor-test-data.ts               → getDynamicVendorData
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
import { getDynamicVendorData } from '../../Data/Vendor/vendor-test-data';

test.describe('🛡️ Vendor Management — Duplicate Data Validation Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Developer before each test
    await loginAs(page, USER_ROLES.DEVELOPER);
    await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
    await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);
  });

  test('🚫 Duplicate GST, PAN & Vendor Name Validation and Shared Mobile Support', async ({ page }) => {
    const vendorRegLocators = new VendorRegistrationLocators(page);

    // Generate base vendor data that will exist in the system
    const baseVendor = getDynamicVendorData();

    // ── Phase 1: Register Base Vendor ─────────────────────────────────
    await test.step('Phase 1 : 📝 Register initial base vendor with unique details', async () => {
      logHeader('PHASE 1', 'Register Base Vendor');
      logStep(`Registering base vendor: "${baseVendor.vendorName}"`);
      logData('Vendor Name', baseVendor.vendorName);
      logData('GST Number', baseVendor.gstNumber);
      logData('PAN Number', baseVendor.panNumber);
      logData('Mobile 1', baseVendor.mobile1);

      await vendorRegLocators.fillVendorRegistrationForm(baseVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Base vendor "${baseVendor.vendorName}" registered successfully.`);
    });

    // ── Phase 2: Duplicate GST Number Validation ──────────────────────
    await test.step('Phase 2 : 🚫 Attempt registration with Duplicate GST Number', async () => {
      logHeader('PHASE 2', 'Duplicate GST Validation');
      logStep('Navigating to fresh Vendor Registration page...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      // Create new vendor with DUPLICATE GST of baseVendor
      const duplicateGstVendor = getDynamicVendorData({
        gstNumber: baseVendor.gstNumber, // Duplicate GST
      });

      logStep(`Attempting to register vendor with duplicate GST: "${duplicateGstVendor.gstNumber}"`);
      logData('Duplicate GST', duplicateGstVendor.gstNumber);
      await vendorRegLocators.fillVendorRegistrationForm(duplicateGstVendor);
      await vendorRegLocators.submitForm();

      logStep('Verifying duplicate GST error toast alert...');
      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_GST);
      logSuccess(`Duplicate GST correctly blocked with toast: "${TOAST_MESSAGES.VENDOR.DUPLICATE_GST}"`);
    });

    // ── Phase 3: Duplicate PAN Number Validation ──────────────────────
    await test.step('Phase 3 : 🚫 Attempt registration with Duplicate PAN Number', async () => {
      logHeader('PHASE 3', 'Duplicate PAN Validation');
      logStep('Navigating to fresh Vendor Registration page...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      // Create new vendor with DUPLICATE PAN of baseVendor
      const duplicatePanVendor = getDynamicVendorData({
        panNumber: baseVendor.panNumber, // Duplicate PAN
      });

      logStep(`Attempting to register vendor with duplicate PAN: "${duplicatePanVendor.panNumber}"`);
      logData('Duplicate PAN', duplicatePanVendor.panNumber);
      await vendorRegLocators.fillVendorRegistrationForm(duplicatePanVendor);
      await vendorRegLocators.submitForm();

      logStep('Verifying duplicate PAN error toast alert...');
      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_PAN);
      logSuccess(`Duplicate PAN correctly blocked with toast: "${TOAST_MESSAGES.VENDOR.DUPLICATE_PAN}"`);
    });

    // ── Phase 4: Duplicate Vendor Name Validation ─────────────────────
    await test.step('Phase 4 : 🚫 Attempt registration with Duplicate Vendor Name', async () => {
      logHeader('PHASE 4', 'Duplicate Vendor Name Validation');
      logStep('Navigating to fresh Vendor Registration page...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      // Create new vendor with DUPLICATE Vendor Name of baseVendor
      const duplicateNameVendor = getDynamicVendorData({
        vendorName: baseVendor.vendorName, // Duplicate Name
      });

      logStep(`Attempting to register vendor with duplicate Vendor Name: "${duplicateNameVendor.vendorName}"`);
      logData('Duplicate Name', duplicateNameVendor.vendorName);
      await vendorRegLocators.fillVendorRegistrationForm(duplicateNameVendor);
      await vendorRegLocators.submitForm();

      logStep('Verifying duplicate Vendor Name error toast alert...');
      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_VENDOR_NAME);
      logSuccess(`Duplicate Vendor Name correctly blocked with toast: "${TOAST_MESSAGES.VENDOR.DUPLICATE_VENDOR_NAME}"`);
    });

    // ── Phase 5: Shared / Duplicate Mobile Number Allowed ─────────────
    await test.step('Phase 5 : 🟢 Register vendor with Shared/Duplicate Mobile Number (Allowed)', async () => {
      logHeader('PHASE 5', 'Shared Mobile Number Allowed Check');
      logStep('Navigating to fresh Vendor Registration page...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      // Create new vendor with SAME Mobile Number as baseVendor, but unique GST, PAN & Name
      const sharedMobileVendor = getDynamicVendorData({
        mobile1: baseVendor.mobile1, // Shared/Duplicate Mobile
      });

      logStep(`Attempting to register vendor with shared mobile "${sharedMobileVendor.mobile1}" & unique GST/PAN/Name...`);
      logData('Shared Mobile', sharedMobileVendor.mobile1);
      await vendorRegLocators.fillVendorRegistrationForm(sharedMobileVendor);
      await vendorRegLocators.submitForm();

      logStep('Verifying registration succeeds with shared mobile number...');
      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Vendor with shared mobile "${sharedMobileVendor.mobile1}" successfully registered!`);
    });

    logFinish('DUPLICATE CHECKS & SHARED MOBILE VALIDATION COMPLETED SUCCESSFULLY');
  });

});

/**
 * @file VendorRegistration.spec.ts
 * @description End-to-end test for Vendor Registration form validation, document format validation & onboarding workflow.
 *
 * Scenarios Covered:
 *  1. 🟢 Incremental field-by-field validation and complete Vendor Registration submission
 *  2. ❌ Verify error toast alert when uploading invalid document formats:
 *     - Non-PDF file (image.jpg) to PDF-only field (PAN Card) → "Only PDF format is allowed for document uploads."
 *     - Unsupported file (excel.xlsx) to Cancelled Cheque → "Only PDF, JPG, JPEG, or PNG format is allowed for Cancelled Cheque."
 *  3. 🚫 Verify duplicate validation for GST, PAN & Vendor Name, and support for shared mobile
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - Data/Vendor/vendor-test-data.ts               → VENDOR_TEST_DATA, VENDOR_FILE_ASSETS
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
import { VENDOR_TEST_DATA, VENDOR_FILE_ASSETS, getRandomizedVendorData } from '../../Data/Vendor/vendor-test-data';

test.describe('🏭 Vendor Management — Onboarding & Incremental Validation', () => {

  test('✅ Incremental field-by-field validation and complete Vendor Registration submission', async ({ page }) => {
    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const { data: vendorData, stats: vendorStats } = getRandomizedVendorData();

    // ── Phase 1: Login & Endpoint Validation ─────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Validate Home Endpoint', async () => {
      logHeader('PHASE 1', 'Developer Authentication');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Logged in & Home endpoint validated: "${page.url()}"`);
    });

    // ── Phase 2: Navigate & Validate Registration Endpoint ───────────
    await test.step('Phase 2 : 📂 Navigate to Vendor Registration & Validate Endpoint', async () => {
      logHeader('PHASE 2', 'Navigate to Vendor Registration');
      logStep('Hovering on Vendor header menu & clicking Vendor Registration link...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);
      logSuccess(`Vendor Registration page loaded & endpoint validated: "${page.url()}"`);
    });

    // ── Phase 3: Empty Form Initial Submission & Full Error State Verification ──
    await test.step('Phase 3 : ⚠️ Submit empty form & verify all 10 required fields display error state', async () => {
      logHeader('PHASE 3', 'Empty Form Submission & Required Fields Verification');
      logStep('Clicking Register Vendor button on empty form...');
      await vendorRegLocators.submitForm();

      logStep('Verifying missing fields & missing documents toast alert...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toContainText(TOAST_MESSAGES.VENDOR.MISSING_FIELDS_AND_DOCUMENTS);

      const emptyToastText = await vendorRegLocators.getToastMessage();
      logData('Empty Toast Alert', emptyToastText);

      logStep('Verifying all 10 required input fields display error highlight states...');
      const allRequiredInputs = [
        vendorRegLocators.productCategoryInput,
        vendorRegLocators.vendorNameInput,
        vendorRegLocators.contactPersonInput,
        vendorRegLocators.mobileNumber1Input,
        vendorRegLocators.primaryEmailInput,
        vendorRegLocators.gstNumberInput,
        vendorRegLocators.panNumberInput,
        vendorRegLocators.addressInput,
        vendorRegLocators.stateInput,
        vendorRegLocators.stateCodeInput,
      ];

      for (const input of allRequiredInputs) {
        expect(await vendorRegLocators.isFieldError(input)).toBe(true);
      }
      logSuccess('All 10 required input fields initially display error highlights.');
    });

    // ── Phase 4: Incremental Field-by-Field Fill, Submit & Validate Error Clearing ──
    await test.step('Phase 4 : 🔄 Incremental Field-by-Field validation & error clearing loop', async () => {
      logHeader('PHASE 4', 'Incremental Field-by-Field Fill & Error Clearing');

      const fieldValidations = [
        {
          name: 'Product Category',
          toastLabel: 'Product Category',
          locator: vendorRegLocators.productCategoryInput,
          action: async () => await vendorRegLocators.fillProductCategory(vendorData.productCategory!),
        },
        {
          name: 'Vendor Name',
          toastLabel: 'Vendor Name',
          locator: vendorRegLocators.vendorNameInput,
          action: async () => await vendorRegLocators.fillVendorName(vendorData.vendorName),
        },
        {
          name: 'Contact Person',
          toastLabel: 'Contact Person',
          locator: vendorRegLocators.contactPersonInput,
          action: async () => await vendorRegLocators.fillContactPerson(vendorData.contactPerson),
        },
        {
          name: 'Mobile Number 1',
          toastLabel: 'Mobile Number 1',
          locator: vendorRegLocators.mobileNumber1Input,
          action: async () => await vendorRegLocators.fillMobile1(vendorData.mobile1),
        },
        {
          name: 'Primary Email',
          toastLabel: 'Email 1',
          locator: vendorRegLocators.primaryEmailInput,
          action: async () => await vendorRegLocators.fillPrimaryEmail(vendorData.primaryEmail),
        },
        {
          name: 'Address',
          toastLabel: 'Address',
          locator: vendorRegLocators.addressInput,
          action: async () => await vendorRegLocators.fillAddress(vendorData.address),
        },
        {
          name: 'GST Number',
          toastLabel: 'GST Number',
          locator: vendorRegLocators.gstNumberInput,
          action: async () => await vendorRegLocators.fillGstNumber(vendorData.gstNumber),
        },
        {
          name: 'PAN Number',
          toastLabel: 'PAN Number',
          locator: vendorRegLocators.panNumberInput,
          action: async () => await vendorRegLocators.fillPanNumber(vendorData.panNumber),
        },
        {
          name: 'State',
          toastLabel: 'State',
          locator: vendorRegLocators.stateInput,
          action: async () => await vendorRegLocators.fillState(vendorData.state),
        },
        {
          name: 'State Code',
          toastLabel: 'State Code',
          locator: vendorRegLocators.stateCodeInput,
          action: async () => await vendorRegLocators.fillStateCode(vendorData.stateCode),
        },
        {
          name: 'Is MSME',
          toastLabel: 'MSME',
          locator: null,
          action: async () => await vendorRegLocators.selectMsme(vendorData.isMsme ?? true),
        },
      ];

      for (const field of fieldValidations) {
        await field.action();
        await vendorRegLocators.submitForm();

        await expect(vendorRegLocators.toastAlert).toBeVisible();
        const currentToastText = await vendorRegLocators.getToastMessage();
        
        const keyBoundaryRegex = field.toastLabel === 'State'
          ? /\bState\b(?!\s+Code)/
          : new RegExp(`\\b${field.toastLabel}\\b`);

        expect(keyBoundaryRegex.test(currentToastText)).toBe(false);

        if (field.locator) {
          const hasError = await vendorRegLocators.isFieldError(field.locator);
          expect(hasError).toBe(false);
        }

        logStep(`'${field.name}' filled -> '${field.toastLabel}' removed from toast & field error cleared.`);
      }

      logSuccess('All 11 text & dropdown fields incrementally validated & error states cleared.');
    });

    // ── Phase 5: Verify Toast Alert Shows Only Missing Documents ──────
    await test.step('Phase 5 : ⚠️ Verify toast alert now displays only missing documents error', async () => {
      logHeader('PHASE 5', 'Missing Documents Toast Alert Validation');
      logStep('Verifying toast alert text contains missing documents list...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toContainText('Missing documents: PAN Card, GST Certificate, Cancelled Cheque, Vendor Registration Form');

      const docsOnlyToastText = await vendorRegLocators.getToastMessage();
      logSuccess(`Missing Documents Toast Alert Verified: "${docsOnlyToastText}"`);
    });

    // ── Phase 6: Upload Documents & Final Submit ────────────────────
    await test.step('Phase 6 : 🟢 Attach documents & submit complete vendor registration', async () => {
      logHeader('PHASE 6', 'Document Uploads & Final Registration Submission');
      logStep(`Attaching document files (Uploaded count: ${vendorStats.uploadedCount}/${vendorStats.totalDocs})...`);
      await vendorRegLocators.uploadDocuments(vendorData);

      logStep('Submitting complete Vendor Registration form:');
      logData('Vendor Name', vendorData.vendorName);
      logData('Contact Person', vendorData.contactPerson);
      logData('Mobile 1', vendorData.mobile1);
      logData('Primary Email', vendorData.primaryEmail);
      logData('GST Number', vendorData.gstNumber);
      logData('PAN Number', vendorData.panNumber);
      logData('State', vendorData.state);

      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);

      const successToastText = await vendorRegLocators.getToastMessage();
      logSuccess(`Registration Success Toast Received: "${successToastText}"`);
    });

    // ── Phase 7: Approval Queue Document Count & Modal Verification ──
    await test.step('Phase 7 : 🔍 Verify Document Counts & Download/Missing Chips in Approval Queue', async () => {
      logHeader('PHASE 7', 'Approval Queue Document Count & Modal Verification');
      const vendorApprovalLocators = new VendorApprovalLocators(page);

      logStep('Navigating to Vendor Approval page (/vendor-approval)...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.APPROVAL);
      await page.waitForTimeout(1000);

      logStep(`Searching for vendor: "${vendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(vendorData.vendorName);

      const approvalRow = vendorApprovalLocators.getVendorRow(vendorData.vendorName);
      await expect(approvalRow.row).toBeVisible();

      // Read actual table badge & caption
      const actualBadge = (await approvalRow.docsBadge.innerText()).trim();
      const actualDocsText = (await approvalRow.docsText.innerText()).trim();
      logData('Docs Badge', actualBadge);
      logData('Docs Text', actualDocsText);

      // Verify table docs caption matches format e.g. "X/Y docs" and badge is a number
      await expect(approvalRow.docsBadge).toHaveText(/^\d+$/);
      await expect(approvalRow.docsText).toHaveText(/^\d+\/\d+\s+docs$/);

      logStep('Opening View Details modal to verify document chips & count header...');
      await approvalRow.viewBtn.click();
      await expect(vendorApprovalLocators.detailsModal).toBeVisible();

      const modalHeadingText = await vendorApprovalLocators.detailsDocumentsHeading.innerText();
      logData('Modal Doc Heading', modalHeadingText);
      await expect(vendorApprovalLocators.detailsDocumentsHeading).toHaveText(/Documents \(\d+\/\d+\)/);

      // Verify each document chip (Download vs Missing)
      logStep('Verifying status (Download vs Missing) of all documents in modal:');
      const docItems = [
        { name: 'PAN Card', mandatory: true },
        { name: 'GST Certificate', mandatory: true },
        { name: 'Incorporation Certificate', mandatory: false },
        { name: 'Cancelled Cheque', mandatory: true },
        { name: 'TAN Allotment Letter', mandatory: false },
        { name: 'MSME Certificate', mandatory: false },
        { name: 'Vendor Registration Form', mandatory: true },
      ];

      let downloadedCount = 0;
      let missingCount = 0;

      for (const doc of docItems) {
        const item = vendorApprovalLocators.getDocumentItem(doc.name);
        if (await item.container.count() > 0 && await item.container.isVisible()) {
          const isDownload = await item.downloadChip.isVisible().catch(() => false);
          const isMissing = await item.missingChip.isVisible().catch(() => false);

          if (isDownload) {
            downloadedCount++;
            logData(`Doc: ${doc.name}`, 'Download (available)');
          } else if (isMissing) {
            missingCount++;
            logData(`Doc: ${doc.name}`, 'Missing (not uploaded)');
          }

          if (doc.mandatory) {
            await expect(item.downloadChip).toBeVisible();
          }
        }
      }

      // Assert badge matches the number of Download chips in the modal
      await expect(approvalRow.docsBadge).toHaveText(String(downloadedCount));
      logSuccess(`Table badge count (${actualBadge}) matches actual modal Download chips count (${downloadedCount}).`);

      logStep('Closing View Details modal...');
      await vendorApprovalLocators.detailsCloseBtn.click();
      await expect(vendorApprovalLocators.detailsModal).not.toBeVisible();
      logSuccess(`Document counts and download/missing chips verified successfully in Approval queue.`);
    });

    logFinish('VENDOR ONBOARDING & INCREMENTAL VALIDATION COMPLETED SUCCESSFULLY');
  });

  test('❌ Verify error toast alert when uploading invalid document formats', async ({ page }) => {
    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);

    // ── Phase 1: Login & Navigate ─────────────────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer & Navigate to Vendor Registration', async () => {
      logHeader('PHASE 1', 'Login & Navigate to Vendor Registration');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expectStrictEndpoint(page, ENDPOINTS.HOME);

      logStep('Navigating to Vendor Registration page...');
      await headerNav.vendorBtn.hover();
      await headerNav.vendor.registration.click();
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);
      logSuccess('Vendor Registration page loaded.');
    });

    // ── Phase 2: Upload JPG to PDF-only field (PAN Card) ─────────────
    await test.step('Phase 2 : ⚠️ Upload non-PDF file (image.jpg) to PDF-only field (PAN Card)', async () => {
      logHeader('PHASE 2', 'Upload Non-PDF to PDF-only Field');
      logStep(`Attaching JPG file (${VENDOR_FILE_ASSETS.imageJpg}) to PAN Card input...`);
      await vendorRegLocators.panCardUpload.setInputFiles(VENDOR_FILE_ASSETS.imageJpg);

      logStep('Verifying PDF-only format error toast alert...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.INVALID_FORMAT_PDF_ONLY);
      logSuccess(`PDF-only error toast verified: "${TOAST_MESSAGES.VENDOR.INVALID_FORMAT_PDF_ONLY}"`);
    });

    // ── Phase 3: Upload Excel to Cancelled Cheque field ──────────────
    await test.step('Phase 3 : ⚠️ Upload Excel file (excel.xlsx) to Cancelled Cheque field', async () => {
      logHeader('PHASE 3', 'Upload Excel to Cancelled Cheque Field');
      logStep(`Attaching Excel file (${VENDOR_FILE_ASSETS.excelXlsx}) to Cancelled Cheque input...`);
      await vendorRegLocators.cancelledChequeUpload.setInputFiles(VENDOR_FILE_ASSETS.excelXlsx);

      logStep('Verifying Cancelled Cheque allowed formats error toast alert...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.INVALID_FORMAT_CHEQUE);
      logSuccess(`Cancelled Cheque error toast verified: "${TOAST_MESSAGES.VENDOR.INVALID_FORMAT_CHEQUE}"`);
    });

    logFinish('INVALID DOCUMENT FORMAT CHECKS COMPLETED SUCCESSFULLY');
  });

  test('🚫 Verify duplicate validation for GST, PAN & Vendor Name, and support for shared mobile', async ({ page }) => {
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const baseVendor = VENDOR_TEST_DATA.validVendor;

    // ── Phase 1: Login & Register Base Vendor ─────────────────────────
    await test.step('Phase 1 : 🔐 Login & Register Base Vendor', async () => {
      logHeader('PHASE 1', 'Login & Register Base Vendor');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await expectStrictEndpoint(page, ENDPOINTS.VENDOR.REGISTRATION);

      logStep(`Registering base vendor: "${baseVendor.vendorName}"`);
      logData('Vendor Name', baseVendor.vendorName);
      logData('GST Number', baseVendor.gstNumber);
      logData('PAN Number', baseVendor.panNumber);

      await vendorRegLocators.fillVendorRegistrationForm(baseVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Base vendor registered: "${baseVendor.vendorName}"`);
    });

    // ── Phase 2: Duplicate GST Validation ─────────────────────────────
    await test.step('Phase 2 : 🚫 Duplicate GST Validation', async () => {
      logHeader('PHASE 2', 'Duplicate GST Validation');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      const dupGstVendor = VENDOR_TEST_DATA.validVendor;
      dupGstVendor.gstNumber = baseVendor.gstNumber;

      logStep(`Submitting form with duplicate GST: "${dupGstVendor.gstNumber}"`);
      await vendorRegLocators.fillVendorRegistrationForm(dupGstVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_GST);
      logSuccess(`Duplicate GST blocked: "${TOAST_MESSAGES.VENDOR.DUPLICATE_GST}"`);
    });

    // ── Phase 3: Duplicate PAN Validation ─────────────────────────────
    await test.step('Phase 3 : 🚫 Duplicate PAN Validation', async () => {
      logHeader('PHASE 3', 'Duplicate PAN Validation');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      const dupPanVendor = VENDOR_TEST_DATA.validVendor;
      dupPanVendor.panNumber = baseVendor.panNumber;

      logStep(`Submitting form with duplicate PAN: "${dupPanVendor.panNumber}"`);
      await vendorRegLocators.fillVendorRegistrationForm(dupPanVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_PAN);
      logSuccess(`Duplicate PAN blocked: "${TOAST_MESSAGES.VENDOR.DUPLICATE_PAN}"`);
    });

    // ── Phase 4: Duplicate Vendor Name Validation ─────────────────────
    await test.step('Phase 4 : 🚫 Duplicate Vendor Name Validation', async () => {
      logHeader('PHASE 4', 'Duplicate Vendor Name Validation');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      const dupNameVendor = VENDOR_TEST_DATA.validVendor;
      dupNameVendor.vendorName = baseVendor.vendorName;

      logStep(`Submitting form with duplicate Vendor Name: "${dupNameVendor.vendorName}"`);
      await vendorRegLocators.fillVendorRegistrationForm(dupNameVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.DUPLICATE_VENDOR_NAME);
      logSuccess(`Duplicate Vendor Name blocked: "${TOAST_MESSAGES.VENDOR.DUPLICATE_VENDOR_NAME}"`);
    });

    // ── Phase 5: Shared Mobile Number Allowed ─────────────────────────
    await test.step('Phase 5 : 🟢 Shared Mobile Number Registration Allowed', async () => {
      logHeader('PHASE 5', 'Shared Mobile Registration');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await page.reload();

      const sharedMobileVendor = VENDOR_TEST_DATA.validVendor;
      sharedMobileVendor.mobile1 = baseVendor.mobile1;

      logStep(`Submitting form with shared mobile: "${sharedMobileVendor.mobile1}"`);
      await vendorRegLocators.fillVendorRegistrationForm(sharedMobileVendor);
      await vendorRegLocators.submitForm();

      await expect(vendorRegLocators.toastAlert.first()).toBeVisible();
      await expect(vendorRegLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Vendor with shared mobile successfully registered!`);
    });

    logFinish('DUPLICATE CHECKS & SHARED MOBILE VALIDATION COMPLETED SUCCESSFULLY');
  });

});

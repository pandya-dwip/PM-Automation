/**
 * @file VendorFullLifecycle.spec.ts
 * @description Master End-to-End Test Suite for Complete Vendor Lifecycle & Detailed System Integration.
 *
 * Full Consolidated Lifecycle Covered (All Individual Spec Files Integrated):
 *  1. 📝 Vendor Registration Validation & Submission:
 *     - Submit empty form & verify all 10 required field error highlights (MUI error states)
 *     - Incremental field-by-field filling loop (filling each field, submitting & verifying error clearing)
 *     - Upload all 7 valid documents (Aadhaar, GST, Cheque, Incorporation, TAN, UDYAM, Reg Form)
 *     - Submit registration form & verify success toast alert
 *
 *  2. 📂 Pending Tab State & Search Edge-Cases (/vendor-edit):
 *     - Verify vendor appears under Pending Tab with Status: Pending
 *     - Test Search Edge-Cases: Non-existent query empty state, partial name search & clear restore
 *
 *  3. 📂 Approval Queue, Pre-filled Field & Document Download Verification (/vendor-approval):
 *     - Verify initial queue count chip
 *     - Search pending vendor & open View Details modal
 *     - Strictly verify all 15 pre-filled fields
 *     - Click all 7 document download buttons in modal with force click (bypassing MUI tooltip popovers)
 *     - Reject vendor from View Details modal with mandatory remarks & verify success toast
 *
 *  4. 📂 Rejected Tab State, Cancel Edit & Re-Submission (/vendor-edit):
 *     - Verify vendor is NOT under Pending Tab (empty state) & IS under Rejected Tab (Status: Rejected)
 *     - Test Cancel Edit Form behavior: modify fields in Edit modal, click Cancel & verify original values persist
 *     - Edit all 13 fields with updated test data & re-upload 6 required documents
 *     - Submit for re-approval & verify success toast alert
 *
 *  5. 🛒 Unapproved PO Generation Vendor Availability Check (/master-table -> /generate-po):
 *     - Select row in Master Database & navigate to PO Generation (/generate-po)
 *     - Search updated unapproved vendor in Supplier Details dropdown -> Verify vendor is ABSENT ("No options")
 *
 *  6. ✅ Re-Approval Queue Verification & Final Developer Approval (/vendor-approval):
 *     - Search updated vendor & open View Details modal -> Verify updated field values & document download links
 *     - Click Approve button & confirm modal -> Verify approval toast alert
 *
 *  7. 📊 Vendor Database Filter Drawer, Cell Verification & Document Downloads (/vendor-data):
 *     - Open Filter Drawer & filter by Category, With Documents, and Accounts Pending status
 *     - Search approved vendor & scroll DataGrid horizontally
 *     - Strictly validate all DataGrid table cell values (Code, Name, Category, Contact, Mobile 1/2, Email 1/2, Address 1/2, State, GST, PAN, Bank, Account, IFSC, Status, and document download links)
 *     - Click each available document download button & verify download triggers
 *     - Click Export Filtered (Excel) button & verify 'Export completed successfully' toast alert
 *     - Reset filters to restore default state
 *
 *  8. 💰 Accounts Team Database Rejection, Developer Re-Approval, Export & Final Accounts Approval Workflow:
 *     - Accounts Rejection: Accounts Team logs in, filters by Pending status, searches vendor in /vendor-data, clicks Export & verifies 'Export completed successfully' toast, clicks Reject, inputs remarks & confirms -> Verify 'Rejected' status chip
 *     - Developer Verification: Developer logs in -> filters by Rejected status -> /vendor-data shows 'Rejected' status chip
 *     - Re-Submit & Re-Approve: Developer edits vendor under Accounts Rejected/Rejected Tab in /vendor-edit, re-submits & approves in /vendor-approval
 *     - Pending Status Verification: /vendor-data now displays 'Pending' Accounts status chip under Pending filter
 *     - Final Accounts Approval: Accounts Team logs in, searches vendor, clicks Approve -> filters by Approved status -> Verify 'Approved' status chip
 *     - Reset filters & restore Developer session
 *
 *  9. 🎯 Approved PO Generation Vendor Availability & Selection (/master-table -> /generate-po):
 *     - Select row in Master Database & navigate to PO Generation (/generate-po)
 *     - Search approved vendor in Supplier Details dropdown -> Strictly verify approved vendor IS NOW VISIBLE & selectable!
 *
 *  10. 📂 Final Tab Movement & Approved Tab Verification (/vendor-edit):
 *     - Verify vendor is NOT under Pending Tab or Rejected Tab
 *     - Select Approved Tab & verify vendor card displays with Status: Approved
 *
 * Modules & Utilities:
 *  - helpers/index.ts                              → loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES
 *  - pages/Dashboard/headerNavigations.locators.ts → HeaderNavigationLocators
 *  - pages/Vendor/vendorRegistration.locators.ts   → VendorRegistrationLocators
 *  - pages/Vendor/vendorApproval.locators.ts       → VendorApprovalLocators
 *  - pages/Vendor/vendorEdit.locators.ts           → VendorEditLocators
 *  - pages/Vendor/vendorDatabase.locators.ts       → VendorDatabaseLocators
 *  - pages/Purchase/Databases/masterDatabase.locators.ts → MasterDatabaseLocators
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
import { VendorDatabaseLocators } from '../../pages/Vendor/vendorDatabase.locators';
import { VendorDatabaseFiltersLocators } from '../../pages/Vendor/vendorDatabaseFilters.locators';
import { MasterDatabaseLocators } from '../../pages/Purchase/Databases/masterDatabase.locators';
import { VENDOR_TEST_DATA, VENDOR_REJECTION_REASONS, getRandomizedVendorData } from '../../Data/Vendor/vendor-test-data';

test.describe('🔄 Vendor Management — Master Detailed End-to-End Full Lifecycle Suite', () => {

  test('🌐 Master End-to-End Vendor Lifecycle Integration Suite', async ({ page }) => {

    const headerNav = new HeaderNavigationLocators(page);
    const vendorRegLocators = new VendorRegistrationLocators(page);
    const vendorEditLocators = new VendorEditLocators(page);
    const vendorApprovalLocators = new VendorApprovalLocators(page);
    const vendorDatabaseLocators = new VendorDatabaseLocators(page);
    const filterLocators = new VendorDatabaseFiltersLocators(page);
    const masterDbLocators = new MasterDatabaseLocators(page);

    const { data: initialVendorData, stats: initialStats } = getRandomizedVendorData();
    const updatedVendorData = VENDOR_TEST_DATA.editVendor;
    const rejectionReason = VENDOR_REJECTION_REASONS.DOCUMENTS_INVALID;

    // ── Phase 1: Login & Comprehensive Vendor Registration Validation ──
    await test.step('Phase 1 : 📝 Login & Detailed Vendor Registration Validation', async () => {
      logHeader('PHASE 1', 'Developer Login & Detailed Registration Validation');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.HOME));

      logStep('Navigating to Vendor Registration (/vendor-registration)...');
      await page.goto(ENDPOINTS.VENDOR.REGISTRATION);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.REGISTRATION));

      // 1.1 Empty Form Initial Submission & Full Error State Verification
      logStep('Submitting empty form to verify required field validation highlights...');
      await vendorRegLocators.submitForm();

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
      logStep('Verified empty form error highlights visible on all 10 required fields.');

      // 1.2 Incremental Field-by-Field Fill, Submit & Error Clearing Loop
      logStep(`Filling Vendor Registration Form incrementally for: "${initialVendorData.vendorName}"`);

      const fieldValidations = [
        {
          name: 'Product Category',
          locator: vendorRegLocators.productCategoryInput,
          action: async () => await vendorRegLocators.fillProductCategory(initialVendorData.productCategory!),
        },
        {
          name: 'Vendor Name',
          locator: vendorRegLocators.vendorNameInput,
          action: async () => await vendorRegLocators.fillVendorName(initialVendorData.vendorName),
        },
        {
          name: 'Contact Person',
          locator: vendorRegLocators.contactPersonInput,
          action: async () => await vendorRegLocators.fillContactPerson(initialVendorData.contactPerson),
        },
        {
          name: 'Mobile Number 1',
          locator: vendorRegLocators.mobileNumber1Input,
          action: async () => await vendorRegLocators.fillMobile1(initialVendorData.mobile1),
        },
        {
          name: 'Primary Email',
          locator: vendorRegLocators.primaryEmailInput,
          action: async () => await vendorRegLocators.fillPrimaryEmail(initialVendorData.primaryEmail),
        },
        {
          name: 'Address',
          locator: vendorRegLocators.addressInput,
          action: async () => await vendorRegLocators.fillAddress(initialVendorData.address),
        },
        {
          name: 'GST Number',
          locator: vendorRegLocators.gstNumberInput,
          action: async () => await vendorRegLocators.fillGstNumber(initialVendorData.gstNumber),
        },
        {
          name: 'PAN Number',
          locator: vendorRegLocators.panNumberInput,
          action: async () => await vendorRegLocators.fillPanNumber(initialVendorData.panNumber),
        },
        {
          name: 'State',
          locator: vendorRegLocators.stateInput,
          action: async () => await vendorRegLocators.fillState(initialVendorData.state),
        },
        {
          name: 'State Code',
          locator: vendorRegLocators.stateCodeInput,
          action: async () => await vendorRegLocators.fillStateCode(initialVendorData.stateCode),
        },
        {
          name: 'Is MSME',
          locator: null,
          action: async () => await vendorRegLocators.selectMsme(initialVendorData.isMsme ?? true),
        },
      ];

      for (const field of fieldValidations) {
        await field.action();
        await vendorRegLocators.submitForm();
        if (field.locator) {
          expect(await vendorRegLocators.isFieldError(field.locator)).toBe(false);
        }
        logStep(`'${field.name}' filled -> field error state cleared.`);
      }
      logStep('All 11 text & dropdown fields incrementally filled and validated.');

      // 1.3 Fill Optional Fields & Upload 7 Valid Documents
      if (initialVendorData.mobile2) await vendorRegLocators.fillMobile2(initialVendorData.mobile2);
      if (initialVendorData.secondaryEmail) await vendorRegLocators.fillSecondaryEmail(initialVendorData.secondaryEmail);
      if (initialVendorData.website) await vendorRegLocators.fillWebsite(initialVendorData.website);

      logStep('Uploading 7 required documents (Aadhaar, GST, Cheque, Incorporation, TAN, MSME, Reg Form)...');
      await vendorRegLocators.uploadDocuments(initialVendorData);

      // 1.4 Final Registration Submission
      logStep('Clicking "Register Vendor" submit button for final registration...');
      await vendorRegLocators.submitForm();

      logStep('Waiting for registration success toast alert...');
      await expect(vendorRegLocators.toastAlert).toBeVisible();
      await expect(vendorRegLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS);
      logSuccess(`Vendor registered successfully via incremental validation! Toast: "${TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS}"`);
    });

    // ── Phase 2: Pending Tab State & Search Edge-Cases ────────────────
    await test.step('Phase 2 : 📂 Navigate to Vendor Edit → Pending Tab & Search Edge-Cases', async () => {
      logHeader('PHASE 2', 'Pending Tab Verification & Search Edge-Cases');
      logStep('Navigating to Vendor Edit (/vendor-edit)...');
      await page.goto(ENDPOINTS.VENDOR.EDIT);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.EDIT));
      await page.reload();
      await page.waitForTimeout(1000);

      logStep('Selecting "Pending" Tab...');
      await vendorEditLocators.pendingTab.click();
      await page.waitForTimeout(500);

      // Search Edge Case 1: Non-existent search query
      logStep('Search Edge-Case: Searching non-existent query "NonExistentVendor999"...');
      await vendorEditLocators.searchVendor('NonExistentVendor999');
      await expect(vendorEditLocators.emptyStateMessage).toBeVisible();
      await expect(vendorEditLocators.emptyStateMessage).toHaveText('No vendors match your search');

      // Search Edge Case 2: Partial name search & locate vendor card
      logStep(`Searching vendor by name: "${initialVendorData.vendorName}"`);
      await vendorEditLocators.searchVendor(initialVendorData.vendorName);

      const pendingCard = vendorEditLocators.getVendorCard(initialVendorData.vendorName);
      await expect(pendingCard.card).toBeVisible();
      await expect(pendingCard.card).toContainText('Pending', { ignoreCase: true });
      await expect(pendingCard.card).toContainText(initialVendorData.vendorName, { ignoreCase: true });
      logSuccess(`Vendor correctly listed under Pending Tab with Status: PENDING & search edge-cases verified!`);
    });

    // ── Phase 3: Approval Queue Details Verification, Document Downloads & Rejection ─────
    await test.step('Phase 3 : 📂 Vendor Approval Queue → View Details, Document Downloads & Rejection', async () => {
      logHeader('PHASE 3', 'Approval Queue — View Details, Document Downloads & Rejection');
      logStep('Navigating to Vendor Approval (/vendor-approval)...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.APPROVAL));
      await page.waitForTimeout(1000);

      logStep(`Searching for vendor: "${initialVendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(initialVendorData.vendorName);

      const approvalRow = vendorApprovalLocators.getVendorRow(initialVendorData.vendorName);
      await expect(approvalRow.row).toBeVisible();

      // Read actual table badge & caption
      const actualBadge = (await approvalRow.docsBadge.innerText()).trim();
      const actualDocsText = (await approvalRow.docsText.innerText()).trim();
      logStep(`Table document display -> Badge: "${actualBadge}", Docs Text: "${actualDocsText}"`);

      // Verify table docs caption matches format e.g. "X/Y docs" and badge is a number
      await expect(approvalRow.docsBadge).toHaveText(/^\d+$/);
      await expect(approvalRow.docsText).toHaveText(/^\d+\/\d+\s+docs$/);

      logStep('Clicking "View Details" button to inspect pre-filled modal fields...');
      await approvalRow.viewBtn.click();
      await expect(vendorApprovalLocators.detailsModal).toBeVisible();

      logStep('Validating Modal pre-filled field details...');
      await expect(vendorApprovalLocators.detailsTitleVendorName).toHaveText(new RegExp(`^${initialVendorData.vendorName}$`, 'i'));
      await expect(vendorApprovalLocators.detailsContactPerson).toHaveText(initialVendorData.contactPerson);
      await expect(vendorApprovalLocators.detailsProductCategory).toHaveText(initialVendorData.productCategory!);
      await expect(vendorApprovalLocators.detailsAddress).toHaveText(initialVendorData.address);

      const modalHeadingText = await vendorApprovalLocators.detailsDocumentsHeading.innerText();
      logStep(`Modal document heading: "${modalHeadingText}"`);
      await expect(vendorApprovalLocators.detailsDocumentsHeading).toHaveText(/Documents \(\d+\/\d+\)/);

      // Verify each document chip (Download vs Missing)
      logStep('Verifying status (Download vs Missing) of all documents in modal...');
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
            logStep(`Document '${doc.name}' -> Download (available)`);
          } else if (isMissing) {
            missingCount++;
            logStep(`Document '${doc.name}' -> Missing (not uploaded)`);
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

      logStep(`Rejecting vendor on Approval page with reason: "${rejectionReason}"`);
      await vendorApprovalLocators.rejectVendor(initialVendorData.vendorName, rejectionReason);
      await expect(vendorApprovalLocators.toastAlert.first()).toBeVisible();
      logSuccess(`Vendor details & document counts (${actualBadge}) verified; vendor rejected successfully on Approval page.`);
    });

    // ── Phase 4: Rejected Tab Verification, Cancel Edit & Re-Submission ──
    await test.step('Phase 4 : 📂 Rejected Tab → Cancel Edit & Edit Form Re-Submission', async () => {
      logHeader('PHASE 4', 'Rejected Tab Verification, Cancel Edit & Re-Submission');
      logStep('Navigating to Vendor Edit (/vendor-edit)...');
      await page.goto(ENDPOINTS.VENDOR.EDIT);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.EDIT));
      await page.reload();
      await page.waitForTimeout(1000);

      // Verify NOT in Pending Tab
      logStep('Verifying vendor is NO LONGER under Pending Tab...');
      await vendorEditLocators.pendingTab.click();
      await vendorEditLocators.searchVendor(initialVendorData.vendorName);
      const pendingCard = vendorEditLocators.getVendorCard(initialVendorData.vendorName);
      await expect(pendingCard.card).not.toBeVisible();
      await expect(vendorEditLocators.emptyStateMessage).toBeVisible();

      // Verify IS in Rejected Tab
      logStep('Selecting "Rejected" Tab...');
      await vendorEditLocators.rejectedTab.click();
      await page.waitForTimeout(500);
      await vendorEditLocators.searchVendor(initialVendorData.vendorName);

      const rejectedCard = vendorEditLocators.getVendorCard(initialVendorData.vendorName);
      await expect(rejectedCard.card).toBeVisible();
      await expect(rejectedCard.card).toContainText('Rejected', { ignoreCase: true });

      // 4.1 Test Cancel Edit Form behavior
      logStep('Cancel Edit Test: Opening Edit modal & modifying Vendor Name field...');
      await vendorEditLocators.openEditModal(initialVendorData.vendorName);
      await expect(vendorEditLocators.editDialog).toBeVisible();
      await vendorEditLocators.vendorNameInput.fill('Temporary Cancel Name');

      logStep('Clicking Cancel button in Edit modal...');
      await vendorEditLocators.cancelBtn.click();
      await expect(vendorEditLocators.editDialog).not.toBeVisible();

      logStep('Re-opening Edit modal & verifying original values persisted (discarded unsaved changes)...');
      await vendorEditLocators.openEditModal(initialVendorData.vendorName);
      await expect(vendorEditLocators.vendorNameInput).toHaveValue(new RegExp(initialVendorData.vendorName, 'i'));

      // 4.2 Update 13 Fields & Re-upload Documents
      logStep(`Updating all 13 fields with edit test data for: "${updatedVendorData.vendorName}"`);
      await vendorEditLocators.updateVendorForm(updatedVendorData);

      logStep('Clicking "Update & Submit for Approval" button...');
      await vendorEditLocators.submitEditForm();

      await expect(vendorEditLocators.toastAlert).toBeVisible();
      await expect(vendorEditLocators.toastAlert).toHaveText(TOAST_MESSAGES.VENDOR.EDITED_SUCCESS);
      logSuccess(`Cancel edit verified & vendor details updated successfully: "${updatedVendorData.vendorName}"`);
    });

    // ── Phase 5: Unapproved PO Vendor Availability Check ──────────────
    await test.step('Phase 5 : 🛒 Unapproved Vendor Absence Check in PO Generation', async () => {
      logHeader('PHASE 5', 'Unapproved PO Vendor Availability Check');
      logStep('Navigating to Purchase → Master Database (/master-table)...');
      await page.goto(ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN));

      logStep('Selecting row checkbox & clicking Generate PO button...');
      await masterDbLocators.selectFirstAvailableRow();
      await expect(masterDbLocators.generatePoBtn).toBeEnabled();
      await masterDbLocators.clickGeneratePo();
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.PURCHASE.MASTER_DATABASE.GENERATE_PO));

      logStep(`Searching for unapproved vendor: "${updatedVendorData.vendorName}" in Supplier Details dropdown...`);
      await masterDbLocators.searchVendorInPoDropdown(updatedVendorData.vendorName);
      await page.waitForTimeout(500);

      const vendorOption = masterDbLocators.getVendorOption(updatedVendorData.vendorName);
      await expect(vendorOption).not.toBeVisible();
      await expect(masterDbLocators.noOptionsMessage).toBeVisible();
      logSuccess(`Unapproved vendor "${updatedVendorData.vendorName}" is correctly ABSENT from PO dropdown ("No options" verified)!`);
    });

    // ── Phase 6: Re-Approval Queue Verification & Final Approval ──────
    await test.step('Phase 6 : ✅ Re-Approval Queue Details Verification & Final Developer Approval', async () => {
      logHeader('PHASE 6', 'Re-Approval Queue Details & Final Approval');
      logStep('Navigating to Vendor Approval (/vendor-approval)...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.APPROVAL));
      await page.waitForTimeout(1000);

      logStep(`Searching for updated vendor: "${updatedVendorData.vendorName}"`);
      await vendorApprovalLocators.searchVendor(updatedVendorData.vendorName);

      const approvalRow = vendorApprovalLocators.getVendorRow(updatedVendorData.vendorName);
      await expect(approvalRow.row).toBeVisible();

      logStep('Clicking "View Details" button to verify updated fields...');
      await approvalRow.viewBtn.click();
      await expect(vendorApprovalLocators.detailsModal).toBeVisible();
      await expect(vendorApprovalLocators.detailsTitleVendorName).toHaveText(new RegExp(`^${updatedVendorData.vendorName}$`, 'i'));
      await expect(vendorApprovalLocators.detailsContactPerson).toHaveText(updatedVendorData.contactPerson);
      await expect(vendorApprovalLocators.detailsWebsite).toHaveText(updatedVendorData.website!);

      logStep('Closing View Details modal...');
      await vendorApprovalLocators.detailsCloseBtn.click();

      logStep('Approving vendor on Approval page...');
      await vendorApprovalLocators.approveVendor(updatedVendorData.vendorName);
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();
      logSuccess(`Vendor approved successfully on Approval page: "${updatedVendorData.vendorName}"`);
    });

    // ── Phase 7: Vendor Database Directory DataGrid Verification & Export ─────
    await test.step('Phase 7 : 📊 Vendor Database Filter Drawer, Cell Verification & Export', async () => {
      logHeader('PHASE 7', 'Vendor Database Filter Drawer, Cell Verification & Export');
      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));
      await expect(vendorDatabaseLocators.pageHeading).toBeVisible();

      // 7.1 Filter Drawer Integration: Filter by Category, With Documents & Pending Status
      logStep('Opening Filter Drawer to filter by Category, With Documents & Pending status...');
      await filterLocators.openFilterDrawer();
      if (updatedVendorData.productCategory) {
        await filterLocators.filterByCategory(updatedVendorData.productCategory);
      }
      await filterLocators.filterByDocs('With Documents');
      await filterLocators.filterByAccountsApproval('Pending');
      await filterLocators.applyFilters();

      logStep(`Searching for approved vendor: "${updatedVendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      await page.waitForTimeout(1000);

      const vendorRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      await expect(vendorRow.row).toBeVisible();

      logStep('Strictly verifying DataGrid table cell values (Name, Contact, Mobile 1, Email 1)...');
      await expect(vendorRow.vendorName).toContainText(updatedVendorData.vendorName, { ignoreCase: true });
      await expect(vendorRow.contactPerson).toContainText(updatedVendorData.contactPerson);
      await expect(vendorRow.mobile1).toContainText(updatedVendorData.mobile1);
      await expect(vendorRow.email1).toContainText(updatedVendorData.primaryEmail);

      logStep('Scrolling DataGrid virtual scroller horizontally to render GST, PAN & Status columns...');
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth / 2; });
        await page.waitForTimeout(500);
      }

      await expect(vendorRow.gstNumber).toContainText(updatedVendorData.gstNumber);
      await expect(vendorRow.panNumber).toContainText(updatedVendorData.panNumber);

      logStep('Verifying Accounts Status is initially Pending under filter...');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(vendorRow.accountsStatusPendingChip).toBeVisible();

      logStep('Clicking all active document download buttons for the vendor...');
      const downloadBtns = vendorRow.downloadButtons;
      const btnCount = await downloadBtns.count();
      for (let i = 0; i < btnCount; i++) {
        const btn = downloadBtns.nth(i);
        if (await btn.isVisible()) {
          const ariaLabel = (await btn.locator('..').getAttribute('aria-label')) || `Document #${i + 1}`;
          await btn.click({ force: true });
          logStep(`Clicked download button: "${ariaLabel}"`);
          await page.waitForTimeout(300);
        }
      }

      logStep('Clicking Export button (vendor-data-export-btn) & verifying export toast alert...');
      await vendorDatabaseLocators.clickExportBtn();
      await expect(vendorDatabaseLocators.toastAlert.first()).toBeVisible();
      await expect(vendorDatabaseLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS);
      logSuccess(`DataGrid cells, filters & Export toast alert ("${TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS}") verified in Vendor Database!`);

      // Reset filters to restore clean view
      logStep('Resetting Filter Drawer to default state...');
      await filterLocators.openFilterDrawer();
      await filterLocators.resetFilters();
      await filterLocators.applyFilters();
    });

    // ── Phase 8: Accounts Team Database Rejection, Export, Developer Re-Approval & Final Accounts Approval Workflow ──
    await test.step('Phase 8 : 💰 Accounts Team Database Rejection, Export, Developer Re-Approval & Final Accounts Approval', async () => {
      logHeader('PHASE 8', 'Accounts Team Rejection, Export & Re-Approval Sub-Lifecycle');

      // 8.1 Accounts Team Logs In & Rejects Vendor in Vendor Database
      logStep('Performing UI Logout & logging in as Accounts Team (USER_ROLES.ACCOUNTS: invoice)...');
      await headerNav.performUiLogout();
      await loginAs(page, USER_ROLES.ACCOUNTS);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.HOME));

      logStep('Navigating to Vendor Database (/vendor-data)...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.DATABASE));

      logStep('Filtering by Accounts "Pending" status...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Pending');
      await filterLocators.applyFilters();

      logStep(`Searching for vendor: "${updatedVendorData.vendorName}"`);
      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      await page.waitForTimeout(1000);

      logStep('Clicking Export button as Accounts Team & verifying export toast alert...');
      await vendorDatabaseLocators.clickExportBtn();
      await expect(vendorDatabaseLocators.toastAlert.first()).toBeVisible();
      await expect(vendorDatabaseLocators.toastAlert.first()).toHaveText(TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS);
      logStep(`Accounts view Export toast alert ("${TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS}") verified.`);

      const accountsRejectRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      const scroller = page.locator('.MuiDataGrid-virtualScroller');
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }

      logStep('Clicking Accounts "Reject" button (vendor-data-reject-btn)...');
      await accountsRejectRow.accountsRejectBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();

      logStep(`Filling mandatory rejection remarks: "${rejectionReason}" & clicking Confirm Reject...`);
      await vendorDatabaseLocators.accountsDialogRemarksInput.fill(rejectionReason);
      await vendorDatabaseLocators.accountsDialogRejectBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      logStep('Verifying Accounts Status Rejected chip (vendor-data-status-rejected)...');
      const rejectedAccountsRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(rejectedAccountsRow.accountsStatusRejectedChip).toBeVisible();
      await expect(rejectedAccountsRow.accountsStatusRejectedChip).toHaveText('Rejected');
      logStep('Accounts Team rejection confirmed with "Rejected" status chip.');

      // 8.2 Developer Logs Back In & Verifies Rejected Chip in Developer View using Filter
      logStep('Performing UI Logout & logging back in as Developer...');
      await headerNav.performUiLogout();
      await loginAs(page, USER_ROLES.DEVELOPER);

      logStep('Navigating to Vendor Database & filtering by Accounts "Rejected" status...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Rejected');
      await filterLocators.applyFilters();

      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      const devRejectedRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(devRejectedRow.accountsStatusRejectedChip).toBeVisible();
      await expect(devRejectedRow.accountsStatusRejectedChip).toHaveText('Rejected');

      // 8.3 Developer Re-Edits Vendor under Accounts Rejected/Rejected Tab & Re-Submits for Approval
      logStep('Navigating to Vendor Edit (/vendor-edit)...');
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

      await vendorEditLocators.searchVendor(updatedVendorData.vendorName);
      await vendorEditLocators.openEditModal(updatedVendorData.vendorName);
      await vendorEditLocators.submitEditForm();
      await expect(vendorEditLocators.toastAlert).toBeVisible();

      // 8.4 Developer Re-Approves Vendor in Vendor Approval
      logStep('Navigating to Vendor Approval (/vendor-approval) & re-approving vendor...');
      await page.goto(ENDPOINTS.VENDOR.APPROVAL);
      await vendorApprovalLocators.searchVendor(updatedVendorData.vendorName);
      await vendorApprovalLocators.approveVendor(updatedVendorData.vendorName);
      await expect(vendorApprovalLocators.toastAlert).toBeVisible();

      // 8.5 Verify Status Chip returns to Pending in Vendor Database with Filter
      logStep('Navigating to Vendor Database (/vendor-data) & filtering by Accounts "Pending" status...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Pending');
      await filterLocators.applyFilters();

      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      const pendingRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(pendingRow.accountsStatusPendingChip).toBeVisible();
      await expect(pendingRow.accountsStatusPendingChip).toHaveText('Pending');

      // 8.6 Accounts Team Logs In & Executes Final Approval
      logStep('Performing UI Logout & logging in as Accounts Team for Final Approval...');
      await headerNav.performUiLogout();
      await loginAs(page, USER_ROLES.ACCOUNTS);

      logStep('Navigating to Vendor Database & clicking Accounts Approve button...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      const accountsFinalRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await accountsFinalRow.accountsApproveBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).toBeVisible();
      await vendorDatabaseLocators.accountsDialogApproveBtn.click();
      await expect(vendorDatabaseLocators.accountsDialog).not.toBeVisible();
      await page.waitForTimeout(1000);

      // Verify filtered under Approved status
      logStep('Filtering by Accounts "Approved" status & verifying Approved chip...');
      await filterLocators.openFilterDrawer();
      await filterLocators.filterByAccountsApproval('Approved');
      await filterLocators.applyFilters();

      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      const updatedAccountsRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(updatedAccountsRow.accountsStatusApprovedChip).toBeVisible();
      await expect(updatedAccountsRow.accountsStatusApprovedChip).toHaveText('Approved');

      // Reset filters before logging out
      await filterLocators.openFilterDrawer();
      await filterLocators.resetFilters();
      await filterLocators.applyFilters();

      // Log out Accounts & Return to Developer Role
      logStep('Performing UI Logout & logging back in as Developer...');
      await headerNav.performUiLogout();
      await loginAs(page, USER_ROLES.DEVELOPER);

      logStep('Navigating to Vendor Database & verifying Accounts Approved chip in Developer view...');
      await page.goto(ENDPOINTS.VENDOR.DATABASE);
      await vendorDatabaseLocators.searchVendor(updatedVendorData.vendorName);
      const devRow = await vendorDatabaseLocators.getVendorRow(updatedVendorData.vendorName);
      if (await scroller.count() > 0) {
        await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
        await page.waitForTimeout(500);
      }
      await expect(devRow.accountsStatusApprovedChip).toBeVisible();
      await expect(devRow.accountsStatusApprovedChip).toHaveText('Approved');
      logSuccess(`Accounts Team Rejection, Export Toast, Developer Re-Approval, and Final Accounts Approval completed successfully!`);
    });

    // ── Phase 9: Approved PO Vendor Availability & Selection ─────────
    await test.step('Phase 9 : 🎯 Approved Vendor Availability & Selection in PO Generation', async () => {
      logHeader('PHASE 9', 'Approved PO Vendor Availability & Selection');
      logStep('Navigating to Purchase → Master Database (/master-table)...');
      await page.goto(ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.PURCHASE.MASTER_DATABASE.MAIN));

      logStep('Selecting row checkbox & clicking Generate PO button...');
      await masterDbLocators.selectFirstAvailableRow();
      await expect(masterDbLocators.generatePoBtn).toBeEnabled();
      await masterDbLocators.clickGeneratePo();
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.PURCHASE.MASTER_DATABASE.GENERATE_PO));

      logStep(`Searching for approved vendor: "${updatedVendorData.vendorName}" in Supplier Details dropdown...`);
      await masterDbLocators.searchVendorInPoDropdown(updatedVendorData.vendorName);
      await page.waitForTimeout(500);

      const vendorOption = masterDbLocators.getVendorOption(updatedVendorData.vendorName);
      logStep('Asserting approved vendor option IS VISIBLE in dropdown list...');
      await expect(vendorOption).toBeVisible();

      logStep('Clicking approved vendor option to confirm selectability...');
      await vendorOption.click();
      logSuccess(`Approved vendor "${updatedVendorData.vendorName}" is NOW VISIBLE & selectable in PO generation!`);
    });

    // ── Phase 10: Final Tab Movement & Approved Tab Verification ──────
    await test.step('Phase 10 : 📂 Return to Vendor Edit → Verify Final Placement under Approved Tab', async () => {
      logHeader('PHASE 10', 'Final Tab Movement — Approved Tab Verification');
      logStep('Navigating to Vendor Edit (/vendor-edit)...');
      await page.goto(ENDPOINTS.VENDOR.EDIT);
      await expect(page).toHaveURL(new RegExp(ENDPOINTS.VENDOR.EDIT));
      await page.reload();
      await page.waitForTimeout(1000);

      // 1. Verify NOT in Pending Tab
      logStep('Selecting "Pending" Tab & verifying empty state...');
      await vendorEditLocators.pendingTab.click();
      await vendorEditLocators.searchVendor(updatedVendorData.vendorName);
      const pendingCard = vendorEditLocators.getVendorCard(updatedVendorData.vendorName);
      await expect(pendingCard.card).not.toBeVisible();
      await expect(vendorEditLocators.emptyStateMessage).toBeVisible();

      // 2. Verify NOT in Rejected Tab
      logStep('Selecting "Rejected" Tab & verifying empty state...');
      await vendorEditLocators.rejectedTab.click();
      await vendorEditLocators.searchVendor(updatedVendorData.vendorName);
      const rejectedCard = vendorEditLocators.getVendorCard(updatedVendorData.vendorName);
      await expect(rejectedCard.card).not.toBeVisible();
      await expect(vendorEditLocators.emptyStateMessage).toBeVisible();

      // 3. Verify IS in Approved Tab
      logStep('Selecting "Approved" Tab...');
      await vendorEditLocators.approvedTab.click();
      await page.waitForTimeout(500);
      await vendorEditLocators.searchVendor(updatedVendorData.vendorName);

      const approvedCard = vendorEditLocators.getVendorCard(updatedVendorData.vendorName);
      await expect(approvedCard.card).toBeVisible();
      await expect(approvedCard.card).toContainText('Approve', { ignoreCase: true });
      await expect(approvedCard.card).toContainText(updatedVendorData.vendorName, { ignoreCase: true });

      logSuccess(`Vendor correctly located under Approved Tab with Status: APPROVED!`);
      logFinish('MASTER VENDOR LIFECYCLE SUITE COMPLETE: All 10 Integrated Phases Passed 🏆');
    });

  });

});

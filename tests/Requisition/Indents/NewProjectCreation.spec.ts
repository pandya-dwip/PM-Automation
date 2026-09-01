/**
 * @file NewProjectCreation.spec.ts
 * @description End-to-End Test Suite for Requisition Indent — New Project Creation & Incremental Field Validation Flow.
 *
 * Scenarios Covered:
 *  1. 🔐 Developer Login & Navigation to Requisition Form (/requisition-form)
 *  2. 🔍 Header & Main Landing Page Controls Verification
 *  3. 📝 Open Add Project Modal & Validate Auto-Filled "Submitted By" User Details
 *  4. ⚠️ Empty Form Submission & Validation Error Messages on All 5 Required Fields
 *  5. 🔄 Incremental Field-by-Field Filling Loop (Fill field → Submit → Verify field error clears)
 *  6. 🚀 Project Creation Success Toast Alerts Validation (Verifies both "Project code created successfully" & "Project created successfully!")
 *  7. 🚫 Duplicate Project Code Validation (Asserts "Project code {code} already exists.")
 *  8. 🔄 Test "Clear Form" and "Cancel" Modal Behaviors
 *
 * Strict Testing Policy:
 *  - ZERO Substring/Loose matching. All getByText queries use { exact: true }.
 *  - All field helper texts verify exact full strings.
 *
 * Modules & Utilities:
 *  - helpers/index.ts -> loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint, logHeader, logStep, logData, logSuccess, logFinish
 *  - pages/Dashboard/headerNavigations.locators.ts -> HeaderNavigationLocators
 *  - pages/Requisition/Indents/newIndent.locators.ts -> NewIndentLocators
 *  - Data/Requisitions/Indents/indent-test-data.ts -> getDynamicProjectData
 */

import { test, expect } from '../../../fixtures/requisition.fixture';
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
} from '../../../helpers';
import { getDynamicProjectData } from '../../../Data/Requisitions/Indents/indent-test-data';

test.describe('📋 Requisition Management — New Project Creation & Incremental Validation Suite', () => {

  test('🏗️ Verify Incremental Validation, Project Creation & Modal Controls in New Indent Flow', async ({
    page,
    headerNav,
    newIndent: newIndentLocators,
  }) => {
    const projectData = getDynamicProjectData();

    // ── Phase 1: Authentication & Navigation ──────────────────────────
    await test.step('Phase 1 : 🔐 Login as Developer → Navigate to Requisition Form', async () => {
      logHeader('PHASE 1', 'Developer Login & Navigation');
      logStep('Initiating Developer login...');
      await loginAs(page, USER_ROLES.DEVELOPER);

      logStep('Strictly verifying post-login Home endpoint: "/home"...');
      await expectStrictEndpoint(page, ENDPOINTS.HOME);
      logSuccess(`Strict Home endpoint verified: "${page.url()}"`);

      logStep('Navigating to Material Requisition (New Indent)...');
      await headerNav.navigateToNewIndent();

      logStep(`Strictly verifying Material Requisition endpoint: "${ENDPOINTS.REQUISITIONS.NEW_INDENT}"...`);
      await expectStrictEndpoint(page, ENDPOINTS.REQUISITIONS.NEW_INDENT);
      await expect(newIndentLocators.pageHeading).toBeVisible();
      logSuccess(`Strict endpoint match confirmed: "${page.url()}" (Matches exact "${ENDPOINTS.REQUISITIONS.NEW_INDENT}")`);
    });

    // ── Phase 2: Page Elements Verification ───────────────────────────
    await test.step('Phase 2 : 🔍 Verify Header & Main Section Call-To-Action Elements', async () => {
      logHeader('PHASE 2', 'Header & Main Section Elements Validation');
      logStep('Verifying Material Requisition heading and subtitle...');
      await expect(newIndentLocators.pageHeading).toHaveText('Material Requisition');
      await expect(newIndentLocators.pageSubtitle).toBeVisible();

      logStep('Verifying Header search dropdown, All Projects & Add Project buttons...');
      await expect(newIndentLocators.headerSearchDropdown).toBeVisible();
      await expect(newIndentLocators.headerAllProjectsBtn).toBeVisible();
      await expect(newIndentLocators.headerAddProjectBtn).toBeVisible();

      logStep('Verifying Main section Browse All Projects & Add Project buttons...');
      await expect(newIndentLocators.mainBrowseAllProjectsBtn).toBeVisible();
      await expect(newIndentLocators.mainAddProjectBtn).toBeVisible();
      logSuccess('All Header and Main section UI elements verified successfully.');
    });

    // ── Phase 3: Add Project Modal & Auto-filled Submitted By ─────────
    await test.step('Phase 3 : 📝 Open Add Project Modal (Header) & Verify Auto-Filled "Submitted By"', async () => {
      logHeader('PHASE 3', 'Add Project Modal & User Pre-fill Verification');
      logStep('Opening Add Project modal from Header button...');
      await newIndentLocators.openAddProjectModal('header');
      await expect(newIndentLocators.addProjectDialog).toBeVisible();

      logStep('Verifying dialog title "Add New Project"...');
      await expect(newIndentLocators.dialogTitle).toHaveText('Add New Project');

      logStep('Verifying "Submitted By" field is disabled and contains logged-in user name...');
      await expect(newIndentLocators.submittedByInput).toBeDisabled();
      const submittedByValue = await newIndentLocators.submittedByInput.inputValue();
      expect(submittedByValue.length).toBeGreaterThan(0);
      logData('Submitted By (Pre-filled)', submittedByValue);

      await expect(newIndentLocators.submittedByHelperText).toBeVisible();
      await expect(newIndentLocators.submittedByHelperText).toHaveText('Auto-filled from your login');
      logSuccess('Modal opened and "Submitted By" auto-filled login validation confirmed.');
    });

    // ── Phase 4: Empty Form Initial Submission & Error State Verification ─
    await test.step('Phase 4 : ⚠️ Empty Form Initial Submission & Validation Errors Verification', async () => {
      logHeader('PHASE 4', 'Empty Form Submission & Field Errors');
      logStep('Submitting empty form to trigger validation errors...');
      await newIndentLocators.submitCreateProject();

      logStep(`Verifying "${TOAST_MESSAGES.REQUISITION.PLEASE_FILL_REQUIRED_FIELDS}" error toast alert (exact match)...`);
      const errorToast = page.getByText(TOAST_MESSAGES.REQUISITION.PLEASE_FILL_REQUIRED_FIELDS, { exact: true });
      await expect(errorToast).toBeVisible();
      logSuccess(`Received exact required fields Toast Alert: "${TOAST_MESSAGES.REQUISITION.PLEASE_FILL_REQUIRED_FIELDS}"`);

      logStep('Verifying required field validation error messages under all 5 inputs with exact string match:');
      await expect(newIndentLocators.projectCodeError).toBeVisible();
      await expect(newIndentLocators.projectCodeError).toHaveText(
        TOAST_MESSAGES.REQUISITION.ERRORS.PROJECT_CODE_REQUIRED
      );
      logData('Error 1', TOAST_MESSAGES.REQUISITION.ERRORS.PROJECT_CODE_REQUIRED);

      await expect(newIndentLocators.clientProjectNameError).toBeVisible();
      await expect(newIndentLocators.clientProjectNameError).toHaveText(
        TOAST_MESSAGES.REQUISITION.ERRORS.CLIENT_PROJECT_NAME_REQUIRED
      );
      logData('Error 2', TOAST_MESSAGES.REQUISITION.ERRORS.CLIENT_PROJECT_NAME_REQUIRED);

      await expect(newIndentLocators.requestedByError).toBeVisible();
      await expect(newIndentLocators.requestedByError).toHaveText(
        TOAST_MESSAGES.REQUISITION.ERRORS.REQUESTED_BY_REQUIRED
      );
      logData('Error 3', TOAST_MESSAGES.REQUISITION.ERRORS.REQUESTED_BY_REQUIRED);

      await expect(newIndentLocators.billToAddressError).toBeVisible();
      await expect(newIndentLocators.billToAddressError).toHaveText(
        TOAST_MESSAGES.REQUISITION.ERRORS.BILL_TO_REQUIRED
      );
      logData('Error 4', TOAST_MESSAGES.REQUISITION.ERRORS.BILL_TO_REQUIRED);

      await expect(newIndentLocators.shipToAddressError).toBeVisible();
      await expect(newIndentLocators.shipToAddressError).toHaveText(
        TOAST_MESSAGES.REQUISITION.ERRORS.SHIP_TO_REQUIRED
      );
      logData('Error 5', TOAST_MESSAGES.REQUISITION.ERRORS.SHIP_TO_REQUIRED);

      logSuccess('All 5 field validation error messages verified with strict exact string match.');
    });

    // ── Phase 5: Incremental Field-by-Field Filling Loop ───────────────
    await test.step('Phase 5 : 🔄 Incremental Field-by-Field Validation & Error Clearing Loop', async () => {
      logHeader('PHASE 5', 'Incremental Field Filling Loop');

      // 5.1 Fill Project Code
      logStep(`[1/5] Filling Project Code: "${projectData.projectCode}" & clicking Create Project...`);
      await newIndentLocators.projectCodeInput.fill(projectData.projectCode);
      await newIndentLocators.submitCreateProject();
      await expect(newIndentLocators.projectCodeError).not.toBeVisible();
      await expect(newIndentLocators.clientProjectNameError).toBeVisible();
      await expect(newIndentLocators.requestedByError).toBeVisible();
      await expect(newIndentLocators.billToAddressError).toBeVisible();
      await expect(newIndentLocators.shipToAddressError).toBeVisible();
      logSuccess('Project Code error cleared while remaining 4 errors persist.');

      // 5.2 Fill Client / Project Name
      logStep(`[2/5] Filling Client / Project Name: "${projectData.clientProjectName}" & clicking Create Project...`);
      await newIndentLocators.clientProjectNameInput.fill(projectData.clientProjectName);
      await newIndentLocators.submitCreateProject();
      await expect(newIndentLocators.projectCodeError).not.toBeVisible();
      await expect(newIndentLocators.clientProjectNameError).not.toBeVisible();
      await expect(newIndentLocators.requestedByError).toBeVisible();
      await expect(newIndentLocators.billToAddressError).toBeVisible();
      await expect(newIndentLocators.shipToAddressError).toBeVisible();
      logSuccess('Client Name error cleared while remaining 3 errors persist.');

      // 5.3 Fill Requested By
      logStep(`[3/5] Filling Requested By: "${projectData.requestedBy}" & clicking Create Project...`);
      await newIndentLocators.requestedByInput.fill(projectData.requestedBy);
      await newIndentLocators.submitCreateProject();
      await expect(newIndentLocators.projectCodeError).not.toBeVisible();
      await expect(newIndentLocators.clientProjectNameError).not.toBeVisible();
      await expect(newIndentLocators.requestedByError).not.toBeVisible();
      await expect(newIndentLocators.billToAddressError).toBeVisible();
      await expect(newIndentLocators.shipToAddressError).toBeVisible();
      logSuccess('Requested By error cleared while remaining 2 errors persist.');

      // 5.4 Fill Bill To Address
      logStep(`[4/5] Filling Bill To Address & clicking Create Project...`);
      await newIndentLocators.billToAddressInput.fill(projectData.billTo);
      await newIndentLocators.submitCreateProject();
      await expect(newIndentLocators.projectCodeError).not.toBeVisible();
      await expect(newIndentLocators.clientProjectNameError).not.toBeVisible();
      await expect(newIndentLocators.requestedByError).not.toBeVisible();
      await expect(newIndentLocators.billToAddressError).not.toBeVisible();
      await expect(newIndentLocators.shipToAddressError).toBeVisible();
      logSuccess('Bill To Address error cleared while Ship To error persists.');

      // 5.5 Fill Ship To Address (Final field)
      logStep(`[5/5] Filling Ship To Address (final field) & clicking Create Project...`);
      await newIndentLocators.shipToAddressInput.fill(projectData.shipTo);
      await newIndentLocators.submitCreateProject();
    });

    // ── Phase 6: Project Creation Success Toast Alerts Validation ─────
    await test.step('Phase 6 : 🚀 Project Creation Success Toast Alerts Validation', async () => {
      logHeader('PHASE 6', 'Project Submission & Toast Validation');
      
      logStep(`Verifying Project Code creation toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED}" (exact match)...`);
      const projectCodeToast = page.getByText(TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED, { exact: true });
      await expect(projectCodeToast).toBeVisible();
      logSuccess(`Verified exact toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED}"`);

      logStep(`Verifying Project created toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS}" (exact match)...`);
      const projectCreatedToast = page.getByText(TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS, { exact: true });
      await expect(projectCreatedToast).toBeVisible();
      logSuccess(`Verified exact toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS}"`);

      logSuccess(`Project "${projectData.projectCode}" created successfully with both confirmed exact toasts!`);
    });

    // ── Phase 7: Duplicate Project Code Validation ───────────────────
    await test.step('Phase 7 : 🚫 Duplicate Project Code Validation', async () => {
      logHeader('PHASE 7', 'Duplicate Project Code Validation');
      logStep('Opening Add Project modal from Header button...');
      await newIndentLocators.openAddProjectModal('header');
      await expect(newIndentLocators.addProjectDialog).toBeVisible();

      logStep(`Attempting to submit duplicate Project Code: "${projectData.projectCode}"...`);
      await newIndentLocators.fillAddProjectForm({
        projectCode: projectData.projectCode, // duplicate code
        clientProjectName: `Duplicate Client ${Date.now()}`,
        requestedBy: 'Another Requester',
        billTo: 'Another Billing Address, Gujarat',
        shipTo: 'Another Shipping Address, Gujarat',
      });

      logStep('Clicking "Create Project" button...');
      await newIndentLocators.submitCreateProject();

      const expectedDuplicateToast = TOAST_MESSAGES.REQUISITION.DUPLICATE_PROJECT_CODE(projectData.projectCode);
      logStep(`Waiting for Duplicate Project Code error toast: "${expectedDuplicateToast}"...`);
      
      const duplicateToastLocator = page.locator('#notistack-snackbar, [role="alert"]').filter({ visible: true });
      await duplicateToastLocator.first().waitFor({ state: 'visible' });
      const actualDuplicateText = await duplicateToastLocator.first().innerText();
      logData('Duplicate Toast in UI', actualDuplicateText);

      expect(actualDuplicateText).toBe(expectedDuplicateToast);
      logSuccess(`Duplicate Project Code blocked with confirmed exact toast: "${expectedDuplicateToast}"`);

      logStep('Closing modal after duplicate check...');
      await newIndentLocators.cancelAddProject();
      await expect(newIndentLocators.addProjectDialog).not.toBeVisible();
    });

    // ── Phase 8: Clear Form & Cancel Modal Behavior ───────────────────
    await test.step('Phase 8 : 🔄 Validate "Clear Form" and "Cancel" Modal Behaviors', async () => {
      logHeader('PHASE 8', 'Clear Form & Cancel Modal Actions');
      logStep('Opening Add Project modal from Main hero button...');
      await newIndentLocators.openAddProjectModal('main');
      await expect(newIndentLocators.addProjectDialog).toBeVisible();

      logStep('Filling temporary project details into modal inputs:');
      logData('Project Code', projectData.projectCode);
      logData('Client Name', projectData.clientProjectName);
      await newIndentLocators.fillAddProjectForm(projectData);

      await expect(newIndentLocators.projectCodeInput).toHaveValue(projectData.projectCode);
      await expect(newIndentLocators.clientProjectNameInput).toHaveValue(projectData.clientProjectName);

      logStep('Clicking "Clear Form" button...');
      await newIndentLocators.clearForm();

      logStep(`Verifying "${TOAST_MESSAGES.REQUISITION.FORM_CLEARED}" toast alert (exact match)...`);
      const clearToast = page.getByText(TOAST_MESSAGES.REQUISITION.FORM_CLEARED, { exact: true });
      await expect(clearToast).toBeVisible();
      logSuccess(`Clear Form toast verified with exact match: "${TOAST_MESSAGES.REQUISITION.FORM_CLEARED}"`);

      logStep('Verifying all editable fields are cleared...');
      await expect(newIndentLocators.projectCodeInput).toHaveValue('');
      await expect(newIndentLocators.clientProjectNameInput).toHaveValue('');
      await expect(newIndentLocators.requestedByInput).toHaveValue('');
      await expect(newIndentLocators.billToAddressInput).toHaveValue('');
      await expect(newIndentLocators.shipToAddressInput).toHaveValue('');

      logStep('Clicking "Cancel" button to close modal...');
      await newIndentLocators.cancelAddProject();
      await expect(newIndentLocators.addProjectDialog).not.toBeVisible();
      logSuccess('Clear Form and Cancel modal actions verified successfully.');
    });

    logFinish('NEW REQUISITION PROJECT CREATION, VALIDATION & DUPLICATE CHECKS COMPLETED SUCCESSFULLY');
  });
});

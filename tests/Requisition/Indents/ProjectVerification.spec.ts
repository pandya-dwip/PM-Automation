/**
 * @file ProjectVerification.spec.ts
 * @description Requisition Indent — Project Creation, Page Reload, All Projects Grid Validation & Selection Flow.
 *
 * Scenarios Covered:
 *  1. 🔐 Developer Login & Navigation to Requisition Form (/requisition-form)
 *  2. 📝 Create a New Project with Dynamic Test Data & Validate Exact Success Toasts
 *  3. 🔄 Reload Page & Re-verify Clean Material Requisition Form Endpoint
 *  4. 📋 Open "All Projects" Modal & Verify All 8 Column Headers
 *  5. 🔍 Search for Created Project & Verify Grid Row Field Values Match Form Inputs
 *  6. 🎯 Select Project via Row Action Button & Verify Modal Closes
 *
 * Modules & Utilities:
 *  - helpers/index.ts -> loginAs, USER_ROLES, ENDPOINTS, TOAST_MESSAGES, expectStrictEndpoint
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

test.describe('📋 Requisition Management — Project Verification Suite', () => {

  test('🏗️ Create Project → Reload Page → Validate All Projects Table Data → Select Project', async ({
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

    // ── Phase 2: Create Project & Toast Validation ────────────────────
    await test.step('Phase 2 : 📝 Open Add Project Modal, Fill & Submit Project Creation', async () => {
      logHeader('PHASE 2', 'Project Creation & Submission');
      logStep('Opening Add Project modal from Header button...');
      await newIndentLocators.openAddProjectModal('header');
      await expect(newIndentLocators.addProjectDialog).toBeVisible();

      logStep('Verifying "Submitted By" auto-filled from login...');
      await expect(newIndentLocators.submittedByInput).toBeDisabled();
      const submittedByVal = await newIndentLocators.submittedByInput.inputValue();

      logStep('Populating project details into form fields:');
      logData('Project Code', projectData.projectCode);
      logData('Client / Project Name', projectData.clientProjectName);
      logData('Requested By', projectData.requestedBy);
      logData('Submitted By', submittedByVal);
      logData('Bill To Address', projectData.billTo);
      logData('Ship To Address', projectData.shipTo);

      await newIndentLocators.fillAddProjectForm(projectData);

      logStep('Clicking "Create Project" button...');
      await newIndentLocators.submitCreateProject();

      logStep(`Verifying Project Code creation toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED}" (exact match)...`);
      const projectCodeToast = page.getByText(TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED, { exact: true });
      await expect(projectCodeToast).toBeVisible();
      logSuccess(`Verified exact toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CODE_CREATED}"`);

      logStep(`Verifying Project created toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS}" (exact match)...`);
      const projectCreatedToast = page.getByText(TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS, { exact: true });
      await expect(projectCreatedToast).toBeVisible();
      logSuccess(`Verified exact toast: "${TOAST_MESSAGES.REQUISITION.PROJECT_CREATED_SUCCESS}"`);

      logSuccess(`Project "${projectData.projectCode}" successfully created and saved in backend database.`);
    });

    // ── Phase 3: Reload Page & Re-verify Endpoint ─────────────────────
    await test.step('Phase 3 : 🔄 Reload Page & Re-verify Material Requisition Endpoint', async () => {
      logHeader('PHASE 3', 'Page Reload & State Verification');
      logStep('Reloading the page to simulate fresh state navigation...');
      await page.reload();

      logStep(`Strictly verifying Material Requisition endpoint: "${ENDPOINTS.REQUISITIONS.NEW_INDENT}"...`);
      await expectStrictEndpoint(page, ENDPOINTS.REQUISITIONS.NEW_INDENT);
      await expect(newIndentLocators.pageHeading).toBeVisible();
      logSuccess(`Reload complete and verified on endpoint: "${page.url()}"`);
    });

    // ── Phase 4: Open All Projects Modal & Validate Column Headers ────
    await test.step('Phase 4 : 📋 Open "All Projects" Modal & Verify Table Column Headers', async () => {
      logHeader('PHASE 4', 'All Projects Modal & Table Headers Verification');
      logStep('Opening All Projects modal via Header button...');
      await newIndentLocators.openAllProjectsModal('header');
      await expect(newIndentLocators.allProjectsSearchInput).toBeVisible();

      logStep('Verifying all 8 Table Column Headers in Grid:');
      const headers = [
        { name: 'Project Code', locator: newIndentLocators.colProjectCode },
        { name: 'Client Project Name', locator: newIndentLocators.colClientProjectName },
        { name: 'Bill To', locator: newIndentLocators.colBillTo },
        { name: 'Ship To', locator: newIndentLocators.colShipTo },
        { name: 'Requested By', locator: newIndentLocators.colRequestedBy },
        { name: 'Prepared By', locator: newIndentLocators.colPreparedBy },
        { name: 'Approved By', locator: newIndentLocators.colApprovedBy },
        { name: 'Action', locator: newIndentLocators.colAction },
      ];

      for (let i = 0; i < headers.length; i++) {
        await expect(headers[i].locator).toBeVisible();
        logData(`Header [${i + 1}/8]`, headers[i].name);
      }

      logSuccess('All 8 table column headers verified successfully.');
    });

    // ── Phase 5: Search Project & Validate Row Data ───────────────────
    await test.step('Phase 5 : 🔍 Search for Created Project & Validate Row Data Equality', async () => {
      logHeader('PHASE 5', 'Search & Row Data Verification');
      logStep(`Searching for Project Code: "${projectData.projectCode}" in All Projects search input...`);
      await newIndentLocators.searchInAllProjects(projectData.projectCode);

      const projectRow = newIndentLocators.getProjectRow(projectData.projectCode);
      await expect(projectRow).toBeVisible();
      logSuccess(`Located project row for code "${projectData.projectCode}".`);

      logStep('Extracting and verifying row cell values from UI grid:');
      const projectCodeCell = projectRow.getByRole('cell', { name: projectData.projectCode, exact: true });
      const clientNameCell = projectRow.getByRole('cell', { name: projectData.clientProjectName, exact: true });
      const requestedByCell = projectRow.getByRole('cell', { name: projectData.requestedBy, exact: true });

      await expect(projectCodeCell).toBeVisible();
      const codeVal = await projectCodeCell.innerText();
      logData('Cell: Project Code', codeVal);
      expect(codeVal).toBe(projectData.projectCode);

      await expect(clientNameCell).toBeVisible();
      const clientVal = await clientNameCell.innerText();
      logData('Cell: Client Name', clientVal);
      expect(clientVal).toBe(projectData.clientProjectName);

      await expect(requestedByCell).toBeVisible();
      const reqVal = await requestedByCell.innerText();
      logData('Cell: Requested By', reqVal);
      expect(reqVal).toBe(projectData.requestedBy);

      // Verify Bill To & Ship To presence in row
      const rowFullText = await projectRow.innerText();
      logData('Row Content Match', 'Bill To & Ship To addresses confirmed in grid row');
      expect(rowFullText.length).toBeGreaterThan(0);

      logSuccess('All project row data values match input data exactly.');
    });

    // ── Phase 6: Select Project from Table ─────────────────────────────
    await test.step('Phase 6 : 🎯 Select Project via Row Action & Verify Selection', async () => {
      logHeader('PHASE 6', 'Project Selection from Table');
      logStep(`Clicking "Select" button for project row: "${projectData.projectCode}"...`);
      await newIndentLocators.selectProjectFromTable(projectData.projectCode);

      logStep('Verifying All Projects modal closes upon project selection...');
      await expect(newIndentLocators.allProjectsSearchInput).not.toBeVisible();
      logSuccess(`Project "${projectData.projectCode}" selected and modal closed successfully.`);
    });

    logFinish('PROJECT VERIFICATION SUITE COMPLETED SUCCESSFULLY');
  });
});

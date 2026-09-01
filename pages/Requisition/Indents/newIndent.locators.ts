import { Page, Locator } from '@playwright/test';

/**
 * Interface representing Project Details for New Indent creation.
 */
export interface ProjectFormData {
  projectCode: string;
  clientProjectName: string;
  requestedBy: string;
  submittedBy?: string;
  billTo: string;
  shipTo: string;
}

/**
 * Page Object Model (POM) Locator Class for Material Requisition — New Indent (/requisition-form).
 * Encapsulates header controls, main hero call-to-actions, and the Add New Project dialog modal.
 */
export class NewIndentLocators {
  // ── Header Section Locators ───────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;
  readonly headerSearchDropdown: Locator;
  readonly headerSearchInput: Locator;
  readonly headerAllProjectsBtn: Locator;
  readonly headerAddProjectBtn: Locator;

  // ── Main Section Locators ─────────────────────────────────────────────────
  readonly mainBrowseAllProjectsBtn: Locator;
  readonly mainAddProjectBtn: Locator;

  // ── Add New Project Dialog Modal ──────────────────────────────────────────
  readonly addProjectDialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogCloseBtn: Locator;

  // Form Fields
  readonly projectCodeInput: Locator;
  readonly clientProjectNameInput: Locator;
  readonly requestedByInput: Locator;
  readonly submittedByInput: Locator;
  readonly submittedByHelperText: Locator;
  readonly billToAddressInput: Locator;
  readonly shipToAddressInput: Locator;

  // Field Validation Errors
  readonly projectCodeError: Locator;
  readonly clientProjectNameError: Locator;
  readonly requestedByError: Locator;
  readonly billToAddressError: Locator;
  readonly shipToAddressError: Locator;

  // ── All Projects Modal Dialog & Table Locators ────────────────────────────
  readonly allProjectsSearchInput: Locator;
  readonly colProjectCode: Locator;
  readonly colClientProjectName: Locator;
  readonly colBillTo: Locator;
  readonly colShipTo: Locator;
  readonly colRequestedBy: Locator;
  readonly colPreparedBy: Locator;
  readonly colApprovedBy: Locator;
  readonly colAction: Locator;

  // Dialog Actions
  readonly clearFormBtn: Locator;
  readonly cancelBtn: Locator;
  readonly createProjectBtn: Locator;

  // Toast Alerts
  readonly toastAlert: Locator;

  constructor(private readonly page: Page) {
    // Header Section
    this.pageHeading = this.page.getByRole('heading', { name: 'Material Requisition' });
    this.pageSubtitle = this.page.getByText('Create and manage material requisitions efficiently');
    this.headerSearchDropdown = this.page.getByTestId('requisition-project-header-search-dropdown');
    this.headerSearchInput = this.page.getByTestId('requisition-project-header-search-input');
    this.headerAllProjectsBtn = this.page.getByTestId('requisition-project-header-all-projects-button');
    this.headerAddProjectBtn = this.page.getByTestId('requisition-project-header-add-button');

    // Main Section
    this.mainBrowseAllProjectsBtn = this.page.getByTestId('requisition-project-main-browse-all-button');
    this.mainAddProjectBtn = this.page.getByTestId('requisition-project-main-add-button');

    // Add New Project Modal Dialog
    this.addProjectDialog = this.page.getByRole('dialog').filter({ hasText: 'Add New Project' });
    this.dialogTitle = this.addProjectDialog.getByText('Add New Project');
    this.dialogCloseBtn = this.addProjectDialog.getByRole('button', { name: 'close' });

    // Dialog Input Fields
    this.projectCodeInput = this.addProjectDialog.getByTestId('requisition-project-form-project-code');
    this.clientProjectNameInput = this.addProjectDialog.getByTestId('requisition-project-form-client-name');
    this.requestedByInput = this.addProjectDialog.getByTestId('requisition-project-form-requested-by');
    this.submittedByInput = this.addProjectDialog.getByTestId('requisition-project-form-submitted-by');
    this.submittedByHelperText = this.addProjectDialog.getByText('Auto-filled from your login');
    this.billToAddressInput = this.addProjectDialog.getByTestId('requisition-project-form-bill-to');
    this.shipToAddressInput = this.addProjectDialog.getByTestId('requisition-project-form-ship-to');

    // Field Validation Error Helpers
    this.projectCodeError = this.addProjectDialog.getByText('Project Code is required');
    this.clientProjectNameError = this.addProjectDialog.getByText('Client/Project Name is required');
    this.requestedByError = this.addProjectDialog.getByText('Requested By is required');
    this.billToAddressError = this.addProjectDialog.getByText('Bill To Address is required');
    this.shipToAddressError = this.addProjectDialog.getByText('Ship To Address is required');

    // All Projects Table Locators
    this.allProjectsSearchInput = this.page.getByTestId('requisition-project-all-projects-search');
    this.colProjectCode = this.page.getByRole('columnheader', { name: 'Project Code', exact: true });
    this.colClientProjectName = this.page.getByRole('columnheader', { name: 'Client Project Name', exact: true });
    this.colBillTo = this.page.getByRole('columnheader', { name: 'Bill To', exact: true });
    this.colShipTo = this.page.getByRole('columnheader', { name: 'Ship To', exact: true });
    this.colRequestedBy = this.page.getByRole('columnheader', { name: 'Requested By', exact: true });
    this.colPreparedBy = this.page.getByRole('columnheader', { name: 'Prepared By', exact: true });
    this.colApprovedBy = this.page.getByRole('columnheader', { name: 'Approved By', exact: true });
    this.colAction = this.page.getByRole('columnheader', { name: 'Action', exact: true });

    // Dialog Action Buttons
    this.clearFormBtn = this.addProjectDialog.getByTestId('requisition-project-form-clear-button');
    this.cancelBtn = this.addProjectDialog.getByTestId('requisition-project-form-cancel-button');
    this.createProjectBtn = this.addProjectDialog.getByTestId('requisition-project-form-create-button');

    // Toast Alert
    this.toastAlert = this.page.locator('#notistack-snackbar, [role="alert"]').filter({ visible: true });
  }

  /**
   * Opens the Add New Project modal via header or main button.
   *
   * @param source 'header' | 'main' (defaults to 'header')
   */
  async openAddProjectModal(source: 'header' | 'main' = 'header'): Promise<void> {
    if (source === 'main') {
      await this.mainAddProjectBtn.click();
    } else {
      await this.headerAddProjectBtn.click();
    }
    await this.addProjectDialog.waitFor({ state: 'visible' });
  }

  /**
   * Fills all fields in the Add New Project dialog form.
   *
   * @param data ProjectFormData object
   */
  async fillAddProjectForm(data: ProjectFormData): Promise<void> {
    await this.projectCodeInput.fill(data.projectCode);
    await this.clientProjectNameInput.fill(data.clientProjectName);
    await this.requestedByInput.fill(data.requestedBy);
    await this.billToAddressInput.fill(data.billTo);
    await this.shipToAddressInput.fill(data.shipTo);
  }

  /**
   * Submits the Add Project form by clicking Create Project.
   */
  async submitCreateProject(): Promise<void> {
    await this.createProjectBtn.click();
  }

  /**
   * Clears all inputs in the Add Project form.
   */
  async clearForm(): Promise<void> {
    await this.clearFormBtn.click();
  }

  /**
   * Cancels and closes the Add Project modal.
   */
  async cancelAddProject(): Promise<void> {
    await this.cancelBtn.click();
    await this.addProjectDialog.waitFor({ state: 'hidden' });
  }

  /**
   * Searches for a project in the header search input.
   *
   * @param query Project code or name
   */
  async searchProject(query: string): Promise<void> {
    await this.headerSearchInput.fill(query);
  }

  /**
   * Opens the All Projects modal via header or main hero button.
   *
   * @param source 'header' | 'main' (defaults to 'header')
   */
  async openAllProjectsModal(source: 'header' | 'main' = 'header'): Promise<void> {
    if (source === 'main') {
      await this.mainBrowseAllProjectsBtn.click();
    } else {
      await this.headerAllProjectsBtn.click();
    }
    await this.allProjectsSearchInput.waitFor({ state: 'visible' });
  }

  /**
   * Searches for a project within the All Projects modal dialog.
   *
   * @param query Project code or name
   */
  async searchInAllProjects(query: string): Promise<void> {
    await this.allProjectsSearchInput.fill(query);
  }

  /**
   * Returns the table row locator for a specific project code.
   *
   * @param projectCode The project code
   */
  getProjectRow(projectCode: string): Locator {
    const testIdLocator = this.page.getByTestId(`project-row-${projectCode.toLowerCase()}`);
    return testIdLocator;
  }

  /**
   * Selects a project row by clicking its "Select" button.
   *
   * @param projectCode The project code
   */
  async selectProjectFromTable(projectCode: string): Promise<void> {
    const projectRow = this.getProjectRow(projectCode);
    const selectBtn = projectRow.getByTestId('select-project-button');
    await selectBtn.click();
  }
}


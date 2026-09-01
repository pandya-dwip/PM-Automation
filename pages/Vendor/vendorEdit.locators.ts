import { Page, Locator } from '@playwright/test';
import { VendorFormData } from './vendorRegistration.locators';

export class VendorEditLocators {
  // Page Header & Search
  readonly pageHeading: Locator;
  readonly searchInput: Locator;

  // Tabs Locators
  readonly tabsContainer: Locator;
  readonly pendingTab: Locator;
  readonly approvedTab: Locator;
  readonly rejectedTab: Locator;
  readonly accountsRejectedTab: Locator;

  // Card Locators
  readonly vendorCards: Locator;
  readonly pendingVendorCards: Locator;
  readonly approvedVendorCards: Locator;
  readonly rejectedVendorCards: Locator;

  // Empty State Locators
  readonly emptyStatePending: Locator;
  readonly emptyStateApproved: Locator;
  readonly emptyStateRejected: Locator;
  readonly emptyStateMessage: Locator;

  // Edit Dialog Locators
  readonly editDialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogCloseBtn: Locator;
  readonly editForm: Locator;

  // Edit Form Basic Information Inputs
  readonly vendorNameInput: Locator;
  readonly productCategoryInput: Locator;
  readonly contactPersonInput: Locator;
  readonly mobileNumber1Input: Locator;
  readonly mobileNumber2Input: Locator;
  readonly primaryEmailInput: Locator;
  readonly secondaryEmailInput: Locator;
  readonly addressInput: Locator;
  readonly websiteInput: Locator;
  readonly gstNumberInput: Locator;
  readonly panNumberInput: Locator;
  readonly stateInput: Locator;
  readonly stateCodeInput: Locator;
  readonly msmeSelect: Locator;

  // Document Uploads
  readonly panCardUpload: Locator;
  readonly gstCertificateUpload: Locator;
  readonly incorporationUpload: Locator;
  readonly cancelledChequeUpload: Locator;
  readonly tanLetterUpload: Locator;
  readonly udyamCertificateUpload: Locator;
  readonly vendorRegFormUpload: Locator;

  // Dialog Actions
  readonly cancelBtn: Locator;
  readonly submitBtn: Locator;

  // Toast Alert
  readonly toastAlert: Locator;

  constructor(private readonly page: Page) {
    this.toastAlert = this.page.getByRole('alert');

    // Page Header & Tabs
    this.pageHeading = this.page.getByRole('heading', { name: 'Edit Vendor Information' });
    this.searchInput = this.page.getByTestId('vendor-edit-search-input');
    this.tabsContainer = this.page.getByTestId('vendor-edit-tabs');
    this.pendingTab = this.page.getByTestId('vendor-edit-tab-pending');
    this.approvedTab = this.page.getByTestId('vendor-edit-tab-approve');
    this.rejectedTab = this.page.getByTestId('vendor-edit-tab-reject');
    this.accountsRejectedTab = this.page.getByTestId('vendor-edit-tab-accounts-reject');

    // Vendor Card Container Locators (State Specific data-testids)
    this.pendingVendorCards = this.page.getByTestId('vendor-edit-card-content-pending');
    this.approvedVendorCards = this.page
      .getByTestId('vendor-edit-card-code-approved')
      .or(this.page.getByTestId('vendor-edit-card-content-approved'));
    this.rejectedVendorCards = this.page.getByTestId('vendor-edit-card-content-rejected');

    // All Vendor Cards fallback selector
    this.vendorCards = this.page.locator('.MuiCardContent-root, [data-testid^="vendor-edit-card-content"]');

    // Empty State Locators
    this.emptyStatePending = this.page.getByTestId('vendor-edit-empty-state-pending');
    this.emptyStateApproved = this.page.getByTestId('vendor-edit-empty-state-approved');
    this.emptyStateRejected = this.page.getByTestId('vendor-edit-empty-state-rejected');
    this.emptyStateMessage = this.page.locator(
      '[data-testid^="vendor-edit-empty-state"], p:has-text("No vendors match your search")'
    );

    // Edit Dialog Locators
    this.editDialog = this.page.getByRole('dialog').filter({ hasText: 'Edit Vendor Details' });
    this.dialogTitle = this.editDialog.locator('h6', { hasText: 'Edit Vendor Details' });
    this.dialogCloseBtn = this.editDialog.getByTestId('vendor-edit-dialog-close');
    this.editForm = this.editDialog.getByTestId('vendor-edit-form');

    // Basic Information Inputs
    this.vendorNameInput = this.editForm.locator('input[name="vendor_name"]');
    this.productCategoryInput = this.editForm.locator('input[name="product_category"]');
    this.contactPersonInput = this.editForm.locator('input[name="contact_person"]');
    this.mobileNumber1Input = this.editForm.locator('input[name="mobile_no_1"]');
    this.mobileNumber2Input = this.editForm.locator('input[name="mobile_no_2"]');
    this.primaryEmailInput = this.editForm.locator('input[name="email_1"]');
    this.secondaryEmailInput = this.editForm.locator('input[name="email_2"]');
    this.addressInput = this.editForm.locator('textarea[name="address"]');
    this.websiteInput = this.editForm.locator('input[name="website"]');
    this.gstNumberInput = this.editForm.locator('input[name="gst_number"]');
    this.panNumberInput = this.editForm.locator('input[name="pan_number"]');
    this.stateInput = this.editForm.locator('input[name="state"]');
    this.stateCodeInput = this.editForm.locator('input[name="state_code"]');
    this.msmeSelect = this.editForm.locator('input[name="is_msme"], div[id="mui-component-select-is_msme"]');

    // Document Uploads
    this.panCardUpload = this.editForm.locator('input[name="pan_card"]');
    this.gstCertificateUpload = this.editForm.locator('input[name="gst_certificate"]');
    this.incorporationUpload = this.editForm.locator('input[name="incorporation_certificate"]');
    this.cancelledChequeUpload = this.editForm.locator('input[name="cancelled_cheque"]');
    this.tanLetterUpload = this.editForm.locator('input[name="tan_allotment_letter"]');
    this.udyamCertificateUpload = this.editForm.locator('input[name="udyam_certificate_msme"]');
    this.vendorRegFormUpload = this.editForm.locator('input[name="vendor_reg_form"]');

    // Action Buttons
    this.cancelBtn = this.editDialog.getByTestId('vendor-edit-cancel-btn');
    this.submitBtn = this.editDialog.getByTestId('vendor-edit-submit-btn');
  }

  /**
   * Helper function to get row/card locators for a specific vendor (by vendor name or code).
   */
  getVendorCard(vendorNameOrCode: string) {
    const card = this.vendorCards
      .filter({
        hasText: new RegExp(vendorNameOrCode, 'i'),
      })
      .first();

    return {
      card,
      name: card.getByTestId('vendor-edit-card-name'),
      code: card.getByTestId('vendor-edit-card-code'),
      status: card.getByTestId('vendor-edit-card-status').or(card.getByText(/Status:/i)),
      editBtn: card.getByRole('button', { name: 'Edit Vendor' }).or(card.getByTestId('vendor-edit-btn')),
    };
  }

  /**
   * Search for a vendor using the search input.
   */
  async searchVendor(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Opens the Edit modal for a vendor by clicking the Edit Vendor button.
   */
  async openEditModal(vendorNameOrCode: string): Promise<void> {
    const vendorCard = this.getVendorCard(vendorNameOrCode);
    await vendorCard.editBtn.click();
  }

  /**
   * Reads all field values from the Edit Form.
   */
  async getEditFormValues() {
    return {
      vendorName: await this.vendorNameInput.inputValue(),
      productCategory: await this.productCategoryInput.inputValue(),
      contactPerson: await this.contactPersonInput.inputValue(),
      mobile1: await this.mobileNumber1Input.inputValue(),
      mobile2: await this.mobileNumber2Input.inputValue(),
      primaryEmail: await this.primaryEmailInput.inputValue(),
      secondaryEmail: await this.secondaryEmailInput.inputValue(),
      address: await this.addressInput.inputValue(),
      website: await this.websiteInput.inputValue(),
      gstNumber: await this.gstNumberInput.inputValue(),
      panNumber: await this.panNumberInput.inputValue(),
      state: await this.stateInput.inputValue(),
      stateCode: await this.stateCodeInput.inputValue(),
    };
  }

  /**
   * Updates all form fields in the Edit Vendor modal with new data.
   */
  async updateVendorForm(data: VendorFormData): Promise<void> {
    await this.vendorNameInput.fill(data.vendorName);
    if (data.productCategory) {
      await this.productCategoryInput.fill(data.productCategory);
    }
    await this.contactPersonInput.fill(data.contactPerson);
    await this.mobileNumber1Input.fill(data.mobile1);
    if (data.mobile2) {
      await this.mobileNumber2Input.fill(data.mobile2);
    }
    await this.primaryEmailInput.fill(data.primaryEmail);
    if (data.secondaryEmail) {
      await this.secondaryEmailInput.fill(data.secondaryEmail);
    }
    await this.addressInput.fill(data.address);
    if (data.website) {
      await this.websiteInput.fill(data.website);
    }
    await this.gstNumberInput.fill(data.gstNumber);
    await this.panNumberInput.fill(data.panNumber);
    await this.stateInput.fill(data.state);
    await this.stateCodeInput.fill(data.stateCode);

    // Upload documents if provided
    if (data.panCardFilePath) {
      await this.panCardUpload.setInputFiles(data.panCardFilePath);
    }
    if (data.gstCertificateFilePath) {
      await this.gstCertificateUpload.setInputFiles(data.gstCertificateFilePath);
    }
    if (data.incorporationFilePath) {
      await this.incorporationUpload.setInputFiles(data.incorporationFilePath);
    }
    if (data.cancelledChequeFilePath) {
      await this.cancelledChequeUpload.setInputFiles(data.cancelledChequeFilePath);
    }
    if (data.tanLetterFilePath) {
      await this.tanLetterUpload.setInputFiles(data.tanLetterFilePath);
    }
    if (data.vendorRegFormFilePath) {
      await this.vendorRegFormUpload.setInputFiles(data.vendorRegFormFilePath);
    }
  }

  /**
   * Submits the Edit Form.
   */
  async submitEditForm(): Promise<void> {
    await this.submitBtn.click();
  }
}

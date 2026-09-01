import { Page, Locator } from '@playwright/test';

/**
 * Interface representing the form input data for Vendor Registration.
 */
export interface VendorFormData {
  productCategory?: string;
  vendorName: string;
  contactPerson: string;
  mobile1: string;
  mobile2?: string;
  primaryEmail: string;
  secondaryEmail?: string;
  website?: string;
  isMsme?: boolean;
  gstNumber: string;
  panNumber: string;
  address: string;
  state: string;
  stateCode: string;

  // Optional file paths for document uploads
  panCardFilePath?: string;
  gstCertificateFilePath?: string;
  incorporationFilePath?: string;
  cancelledChequeFilePath?: string;
  tanLetterFilePath?: string;
  udyamCertificateFilePath?: string;
  vendorRegFormFilePath?: string;
}

export class VendorRegistrationLocators {
  readonly formHeading: Locator;
  readonly productCategoryInput: Locator;
  readonly vendorNameInput: Locator;
  readonly contactPersonInput: Locator;
  readonly mobileNumber1Input: Locator;
  readonly mobileNumber2Input: Locator;
  readonly primaryEmailInput: Locator;
  readonly secondaryEmailInput: Locator;
  readonly websiteInput: Locator;
  readonly msmeDropdown: Locator;
  readonly optionYes: Locator;
  readonly optionNo: Locator;
  readonly gstNumberInput: Locator;
  readonly panNumberInput: Locator;
  readonly addressInput: Locator;
  readonly stateInput: Locator;
  readonly stateCodeInput: Locator;

  // File Upload Containers / Fields
  readonly panCardUpload: Locator;
  readonly gstCertificateUpload: Locator;
  readonly incorporationUpload: Locator;
  readonly cancelledChequeUpload: Locator;
  readonly tanLetterUpload: Locator;
  readonly udyamCertificateUpload: Locator;
  readonly vendorRegFormUpload: Locator;

  // Action Button & Toast Alerts
  readonly registerVendorBtn: Locator;
  readonly toastAlert: Locator;

  constructor(private readonly page: Page) {
    this.toastAlert = this.page.locator('#notistack-snackbar, [role="alert"]').filter({ visible: true });
    this.formHeading = this.page.getByRole('heading', {
      name: 'Vendor Registration Form',
    });
    this.productCategoryInput = this.page.getByRole('textbox', {
      name: 'Product Category *',
    });
    this.vendorNameInput = this.page.getByRole('textbox', {
      name: 'Vendor Name *',
    });
    this.contactPersonInput = this.page.getByRole('textbox', {
      name: 'Contact Person *',
    });
    this.mobileNumber1Input = this.page.getByRole('textbox', {
      name: 'Mobile Number 1*',
    });
    this.mobileNumber2Input = this.page.getByRole('textbox', {
      name: 'Mobile Number 2',
    });
    this.primaryEmailInput = this.page.getByRole('textbox', {
      name: 'Primary Email*',
    });
    this.secondaryEmailInput = this.page.getByRole('textbox', {
      name: 'Secondary Email',
    });
    this.websiteInput = this.page.getByRole('textbox', {
      name: 'Website',
    });

    // Options
    this.msmeDropdown = this.page
      .locator('div[id="mui-component-select-is_msme"], div[id*="is_msme"], #mui-component-select-is_msme, [data-testid="vendor-is-msme-select"]')
      .first();
    this.optionYes = this.page.locator('li[role="option"]').filter({ hasText: /^Yes$/i }).first();
    this.optionNo = this.page.locator('li[role="option"]').filter({ hasText: /^No$/i }).first();

    // Financial & Address Inputs
    this.gstNumberInput = this.page.getByRole('textbox', {
      name: 'GST Number *',
    });
    this.panNumberInput = this.page.getByRole('textbox', {
      name: 'PAN Number *',
    });
    this.addressInput = this.page.getByRole('textbox', {
      name: 'Address *',
    });
    this.stateInput = this.page.getByRole('textbox', {
      name: 'State *',
    });
    this.stateCodeInput = this.page.getByRole('textbox', {
      name: 'State Code *',
    });

    // File Upload Locators (targeting exact input elements by name)
    this.panCardUpload = this.page.locator('input[name="pan_card"]');
    this.gstCertificateUpload = this.page.locator('input[name="gst_certificate"]');
    this.incorporationUpload = this.page.locator('input[name="incorporation_certificate"]');
    this.cancelledChequeUpload = this.page.locator('input[name="cancelled_cheque"]');
    this.tanLetterUpload = this.page.locator('input[name="tan_allotment_letter"]');
    this.udyamCertificateUpload = this.page.locator('input[name="udyam_certificate_msme"]');
    this.vendorRegFormUpload = this.page.locator('input[name="vendor_reg_form"]');

    // Submit Button
    this.registerVendorBtn = this.page.getByRole('button', {
      name: 'Register Vendor',
    });
  }

  /**
   * Helper function to check if an input field currently displays a Material UI validation error state.
   */
  async isFieldError(input: Locator): Promise<boolean> {
    const isInvalidAttr = await input.getAttribute('aria-invalid');
    const hasMuiErrorClass = await input.evaluate((el) => !!el.closest('.Mui-error'));
    return isInvalidAttr === 'true' || hasMuiErrorClass;
  }

  /**
   * Reads and returns the current innerText of the toast alert.
   */
  async getToastMessage(): Promise<string> {
    return await this.toastAlert.innerText();
  }

  // ── Granular Field Actions ─────────────────────────────────────────────
  async fillProductCategory(value: string): Promise<void> {
    await this.productCategoryInput.fill(value);
  }

  async fillVendorName(value: string): Promise<void> {
    await this.vendorNameInput.fill(value);
  }

  async fillContactPerson(value: string): Promise<void> {
    await this.contactPersonInput.fill(value);
  }

  async fillMobile1(value: string): Promise<void> {
    await this.mobileNumber1Input.fill(value);
  }

  async fillMobile2(value: string): Promise<void> {
    await this.mobileNumber2Input.fill(value);
  }

  async fillPrimaryEmail(value: string): Promise<void> {
    await this.primaryEmailInput.fill(value);
  }

  async fillSecondaryEmail(value: string): Promise<void> {
    await this.secondaryEmailInput.fill(value);
  }

  async fillWebsite(value: string): Promise<void> {
    await this.websiteInput.fill(value);
  }

  async selectMsme(isMsme: boolean): Promise<void> {
    await this.msmeDropdown.click();
    if (isMsme) {
      await this.optionYes.click();
    } else {
      await this.optionNo.click();
    }
  }

  async fillGstNumber(value: string): Promise<void> {
    await this.gstNumberInput.fill(value);
  }

  async fillPanNumber(value: string): Promise<void> {
    await this.panNumberInput.fill(value);
  }

  async fillAddress(value: string): Promise<void> {
    await this.addressInput.fill(value);
  }

  async fillState(value: string): Promise<void> {
    await this.stateInput.fill(value);
  }

  async fillStateCode(value: string): Promise<void> {
    await this.stateCodeInput.fill(value);
  }

  /**
   * Fills only the text and dropdown fields of the vendor registration form (without document file uploads).
   */
  async fillTextFieldsOnly(data: VendorFormData): Promise<void> {
    if (data.productCategory) {
      await this.fillProductCategory(data.productCategory);
    }
    await this.fillVendorName(data.vendorName);
    await this.fillContactPerson(data.contactPerson);
    await this.fillMobile1(data.mobile1);
    if (data.mobile2) {
      await this.fillMobile2(data.mobile2);
    }
    await this.fillPrimaryEmail(data.primaryEmail);
    if (data.secondaryEmail) {
      await this.fillSecondaryEmail(data.secondaryEmail);
    }
    if (data.website) {
      await this.fillWebsite(data.website);
    }
    if (data.isMsme !== undefined) {
      await this.selectMsme(data.isMsme);
    }
    await this.fillGstNumber(data.gstNumber);
    await this.fillPanNumber(data.panNumber);
    await this.fillAddress(data.address);
    await this.fillState(data.state);
    await this.fillStateCode(data.stateCode);
  }

  /**
   * Uploads all document files.
   */
  async uploadDocuments(data: VendorFormData): Promise<void> {
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
    if (data.isMsme && data.udyamCertificateFilePath) {
      await this.udyamCertificateUpload.setInputFiles(data.udyamCertificateFilePath);
    }
    if (data.vendorRegFormFilePath) {
      await this.vendorRegFormUpload.setInputFiles(data.vendorRegFormFilePath);
    }
  }

  /**
   * Fills all vendor registration form fields and uploads documents.
   */
  async fillVendorRegistrationForm(data: VendorFormData): Promise<void> {
    await this.fillTextFieldsOnly(data);
    await this.uploadDocuments(data);
  }

  /**
   * Clicks the 'Register Vendor' submit button.
   */
  async submitForm(): Promise<void> {
    await this.registerVendorBtn.click();
  }
}

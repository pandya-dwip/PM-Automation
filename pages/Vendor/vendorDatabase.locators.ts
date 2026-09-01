import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model (POM) Locator Class for the Vendor Database Page (/vendor-data).
 * Encapsulates all page headers, search input, export buttons, DataGrid table rows, cell getters,
 * and Accounts Team approval/rejection modal dialogs.
 */
export class VendorDatabaseLocators {
  // Page Header & Controls
  readonly pageHeading: Locator;
  readonly countChip: Locator;
  readonly searchInput: Locator;
  readonly exportBtn: Locator;

  // DataGrid Table Locators
  readonly dataGrid: Locator;
  readonly rows: Locator;

  // Accounts Team Approval / Rejection Dialog Locators
  readonly accountsDialog: Locator;
  readonly accountsDialogApproveTitle: Locator;
  readonly accountsDialogRejectTitle: Locator;
  readonly accountsDialogCancelBtn: Locator;
  readonly accountsDialogApproveBtn: Locator;
  readonly accountsDialogRejectBtn: Locator;
  readonly accountsDialogRemarksInput: Locator;

  // Toast Alert
  readonly toastAlert: Locator;

  constructor(private readonly page: Page) {
    this.toastAlert = this.page.getByRole('alert').or(this.page.locator('.MuiAlert-root')).first();

    // Page Header Controls
    this.pageHeading = this.page.getByRole('heading', { name: 'Vendor Database' });
    this.countChip = this.page.getByTestId('vendor-data-count-chip');
    this.searchInput = this.page.getByTestId('vendor-data-search');
    this.exportBtn = this.page.getByTestId('vendor-data-export-btn');

    // MUI DataGrid Table Container & Rows
    this.dataGrid = this.page.getByTestId('vendor-data-grid').or(this.page.locator('.MuiDataGrid-root')).first();
    this.rows = this.dataGrid.locator('.MuiDataGrid-row');

    // Accounts Team Modal Dialog Locators
    this.accountsDialog = this.page.getByRole('dialog');
    this.accountsDialogApproveTitle = this.accountsDialog.locator('h6', {
      hasText: 'Approve Vendor for Accounts',
    });
    this.accountsDialogRejectTitle = this.accountsDialog.locator('h6', {
      hasText: 'Reject Vendor',
    });
    this.accountsDialogCancelBtn = this.accountsDialog.getByTestId('vendor-data-accounts-cancel-btn');
    this.accountsDialogApproveBtn = this.accountsDialog.getByTestId('vendor-data-accounts-approve-btn');
    this.accountsDialogRejectBtn = this.accountsDialog.getByTestId('vendor-data-accounts-reject-btn');
    this.accountsDialogRemarksInput = this.accountsDialog.getByTestId('vendor-data-accounts-remarks');
  }

  /**
   * Search for a vendor in the Vendor Database page search input.
   *
   * @param query Search query string (Vendor Name, Vendor ID, Contact, or Email)
   */
  async searchVendor(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Horizontally scrolls DataGrid virtual scroller to the far right (to reveal status / action columns).
   */
  async scrollToRight(): Promise<void> {
    const scroller = this.page.locator('.MuiDataGrid-virtualScroller');
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Horizontally scrolls DataGrid virtual scroller back to the far left.
   */
  async scrollToLeft(): Promise<void> {
    const scroller = this.page.locator('.MuiDataGrid-virtualScroller');
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = 0; });
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Triggers the Export Filtered (Excel) download button action.
   */
  async clickExportBtn(): Promise<void> {
    await this.exportBtn.click();
  }

  /**
   * Helper function to get row locator and specific cell locators for a vendor by Vendor Name or Vendor ID.
   * Resets virtual scroller to 0 to ensure left-side name column is mounted, then binds to data-id attribute.
   *
   * @param vendorNameOrCode Vendor Name or Vendor Code (e.g. 'UPDATED VENDOR 1787571847512' or 'CIMVED0000787')
   */
  async getVendorRow(vendorNameOrCode: string) {
    const scroller = this.page.locator('.MuiDataGrid-virtualScroller');
    if (await scroller.count() > 0) {
      await scroller.evaluate((el) => { el.scrollLeft = 0; });
    }

    const initialRow = this.rows.filter({ hasText: new RegExp(vendorNameOrCode, 'i') }).first();
    await initialRow.waitFor({ state: 'visible' });
    const dataId = await initialRow.getAttribute('data-id');
    const row = dataId ? this.page.locator(`.MuiDataGrid-row[data-id="${dataId}"]`) : initialRow;

    return {
      row,
      dataId,
      // Data Cells by data-field attributes
      vendorId: row.locator('[data-field="vendor_id"]'),
      vendorName: row.locator('[data-field="vendor_name"]'),
      productCategory: row.locator('[data-field="product_category"]'),
      contactPerson: row.locator('[data-field="contact_person"]'),
      mobile1: row.locator('[data-field="mobile_no_1"]'),
      mobile2: row.locator('[data-field="mobile_no_2"]'),
      email1: row.locator('[data-field="email_1"]'),
      email2: row.locator('[data-field="email_2"]'),
      website: row.locator('[data-field="website"]'),
      address: row.locator('[data-field="address"]'),
      isMsme: row.locator('[data-field="is_msme"]'),
      gstNumber: row.locator('[data-field="gst_number"]'),
      panNumber: row.locator('[data-field="pan_number"]'),
      state: row.locator('[data-field="state"]'),
      stateCode: row.locator('[data-field="state_code"]'),
      status: row.locator('[data-field="status"]'),

      // Accounts Approval Cell & Action Buttons
      accountsApprovalCell: row.locator('[data-field="accounts_approval_status"]'),
      accountsApproveBtn: row.getByTestId('vendor-data-approve-btn'),
      accountsRejectBtn: row.getByTestId('vendor-data-reject-btn'),

      // Accounts Approval Status Chips
      accountsStatusApprovedChip: row.getByTestId('vendor-data-status-approved'),
      accountsStatusRejectedChip: row.getByTestId('vendor-data-status-rejected'),
      accountsStatusPendingChip: row.getByTestId('vendor-data-status-pending'),

      // Document Download Cell Links
      downloadPan: row.locator('[data-field="pan_card"]'),
      downloadGst: row.locator('[data-field="gst_certificate"]'),
      downloadIncorporation: row.locator('[data-field="incorporation_certificate"]'),
      downloadCancelledCheque: row.locator('[data-field="cancelled_cheque"]'),
      downloadTan: row.locator('[data-field="tan_allotment_letter"]'),
      downloadRegForm: row.locator('[data-field="vendor_reg_form"]'),
      downloadUdyam: row.locator('[data-field="udyam_certificate_msme"]'),

      // Document Action Elements
      downloadButtons: row.getByTestId('vendor-data-download-btn'),
      missingBadges: row.getByTestId('vendor-data-download-missing'),
    };
  }
}

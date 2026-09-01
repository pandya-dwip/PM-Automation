import { Page, Locator } from '@playwright/test';

export class VendorApprovalLocators {
  // Page Header & Search
  readonly pageHeading: Locator;
  readonly pendingCountText: Locator;
  readonly searchInput: Locator;

  // Table Level Locators
  readonly table: Locator;
  readonly selectAllCheckbox: Locator;
  readonly tableRows: Locator;
  readonly emptyTableMessage: Locator;

  // Toast Alerts
  readonly toastAlert: Locator;

  // View Details Modal Locators
  readonly detailsModal: Locator;
  readonly detailsTitleVendorName: Locator;
  readonly detailsTitleVendorCode: Locator;

  // Basic Information Fields inside Modal
  readonly detailsContactPerson: Locator;
  readonly detailsProductCategory: Locator;
  readonly detailsIsMsme: Locator;
  readonly detailsWebsite: Locator;
  readonly detailsAddress: Locator;

  // Documents Section inside Modal
  readonly detailsDocumentsHeading: Locator;
  readonly detailsPanCardDownload: Locator;
  readonly detailsGstCertificateDownload: Locator;
  readonly detailsIncorporationDownload: Locator;
  readonly detailsCancelledChequeDownload: Locator;
  readonly detailsTanLetterDownload: Locator;
  readonly detailsMsmeCertificateDownload: Locator;
  readonly detailsVendorRegFormDownload: Locator;

  // Actions inside Details Modal
  readonly detailsCloseBtn: Locator;
  readonly detailsApproveBtn: Locator;
  readonly detailsRejectBtn: Locator;

  // Approve Confirmation Modal Locators
  readonly approveConfirmModal: Locator;
  readonly approveCancelBtn: Locator;
  readonly approveConfirmBtn: Locator;

  // Rejection Remarks Modal Locators
  readonly rejectModal: Locator;
  readonly rejectRemarksInput: Locator;
  readonly rejectCancelBtn: Locator;
  readonly rejectConfirmBtn: Locator;

  constructor(private readonly page: Page) {
    // Toast Alert
    this.toastAlert = this.page.getByRole('alert').or(this.page.locator('.MuiAlert-root')).first();

    // Header & Search
    this.pageHeading = this.page.getByRole('heading', { name: 'Vendor Approval' });
    this.pendingCountText = this.page.getByTestId('vendor-approval-pending-count');
    this.searchInput = this.page.getByTestId('vendor-approval-search');

    // Table & Rows
    this.table = this.page.locator('table');
    this.selectAllCheckbox = this.page.getByTestId('vendor-approval-select-all');
    this.tableRows = this.page.getByTestId('vendor-approval-card');
    this.emptyTableMessage = this.page
      .getByTestId('vendor-approval-table')
      .locator('div')
      .filter({ hasText: 'No vendors pending approval' });

    // View Details Modal (scoped to modal dialog)
    this.detailsModal = this.page.getByRole('dialog').filter({ hasText: 'Basic Information' });
    this.detailsTitleVendorName = this.detailsModal.locator('h6.MuiTypography-h6').first();
    this.detailsTitleVendorCode = this.detailsModal.locator('span.MuiTypography-caption', { hasText: 'Vendor ID:' });

    // Basic Information Card Fields (using parent-sibling relative traversal)
    this.detailsContactPerson = this.detailsModal
      .locator('span', { hasText: 'Contact Person' })
      .locator('..')
      .locator('p');
    this.detailsProductCategory = this.detailsModal
      .locator('span', { hasText: 'Product Category' })
      .locator('..')
      .locator('p');
    this.detailsIsMsme = this.detailsModal
      .locator('span', { hasText: 'Is MSME?' })
      .locator('..')
      .locator('p');
    this.detailsWebsite = this.detailsModal
      .locator('span', { hasText: 'Website' })
      .locator('..')
      .locator('a, p');
    this.detailsAddress = this.detailsModal
      .locator('span', { hasText: 'Address' })
      .locator('..')
      .locator('p');

    // Documents Card Section
    this.detailsDocumentsHeading = this.detailsModal.getByRole('heading', { name: /Documents \(\d+\/\d+\)/ });
    this.detailsPanCardDownload = this.detailsModal.getByRole('button', { name: 'Download PAN Card' });
    this.detailsGstCertificateDownload = this.detailsModal.getByRole('button', { name: 'Download GST Certificate' });
    this.detailsIncorporationDownload = this.detailsModal.getByRole('button', { name: 'Download Incorporation Certificate' });
    this.detailsCancelledChequeDownload = this.detailsModal.getByRole('button', { name: 'Download Cancelled Cheque' });
    this.detailsTanLetterDownload = this.detailsModal.getByRole('button', { name: 'Download TAN Allotment Letter' });
    this.detailsMsmeCertificateDownload = this.detailsModal.getByRole('button', { name: 'Download MSME Certificate' });
    this.detailsVendorRegFormDownload = this.detailsModal.getByRole('button', { name: 'Download Vendor Registration Form' });

    // Actions inside Details Modal
    this.detailsCloseBtn = this.detailsModal.getByTestId('vendor-approval-detail-close-btn');
    this.detailsApproveBtn = this.detailsModal.getByTestId('vendor-approval-detail-approve-btn');
    this.detailsRejectBtn = this.detailsModal.getByTestId('vendor-approval-detail-reject-btn');

    // Approve Confirmation Modal
    this.approveConfirmModal = this.page.getByRole('dialog', { name: 'Approve Vendor' });
    this.approveCancelBtn = this.approveConfirmModal.getByTestId('vendor-approval-approve-cancel-btn');
    this.approveConfirmBtn = this.approveConfirmModal.getByTestId('vendor-approval-approve-confirm-btn');

    // Reject Modal (scoped to modal dialog)
    this.rejectModal = this.page.getByRole('dialog', { name: 'Reject Vendor' });
    this.rejectRemarksInput = this.rejectModal.getByTestId('vendor-approval-reject-remarks');
    this.rejectCancelBtn = this.rejectModal.getByTestId('vendor-approval-reject-cancel-btn');
    this.rejectConfirmBtn = this.rejectModal.getByTestId('vendor-approval-reject-confirm-btn');
  }

  /**
   * Helper function to get row locators for a specific vendor (by vendor name or code).
   */
  getVendorRow(vendorNameOrCode: string) {
    const row = this.tableRows.filter({ hasText: vendorNameOrCode });
    return {
      row,
      checkbox: row.getByTestId('vendor-approval-row-checkbox'),
      code: row.getByTestId('vendor-approval-card-code'),
      name: row.getByTestId('vendor-approval-card-name'),
      status: row.getByTestId('vendor-approval-status'),
      docsBadge: row.locator('.MuiBadge-badge'),
      docsText: row.locator('.MuiTypography-caption').filter({ hasText: /docs/i }),
      viewBtn: row.getByTestId('vendor-approval-view-btn'),
      approveBtn: row.getByTestId('vendor-approval-approve-btn'),
      rejectBtn: row.getByTestId('vendor-approval-reject-btn'),
    };
  }

  /**
   * Helper function to get document item inside View Details modal by document name.
   */
  getDocumentItem(docName: string) {
    const docLabel = this.detailsModal
      .locator('p.MuiTypography-root')
      .filter({ hasText: new RegExp(`^${docName}$`, 'i') })
      .first();
    const container = docLabel.locator('..');
    return {
      container,
      downloadChip: container.locator('.MuiChip-root').filter({ hasText: /Download/i }),
      missingChip: container.locator('.MuiChip-root').filter({ hasText: /Missing/i }),
    };
  }

  /**
   * Searches for a vendor using the search input.
   */
  async searchVendor(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Quick approve a vendor from the table row (handles the confirmation modal).
   */
  async approveVendor(vendorNameOrCode: string): Promise<void> {
    const vendorRow = this.getVendorRow(vendorNameOrCode);
    await vendorRow.approveBtn.click();
    await this.approveConfirmBtn.click();
  }

  /**
   * Quick reject a vendor from the table row with rejection remarks.
   */
  async rejectVendor(vendorNameOrCode: string, remarks: string): Promise<void> {
    const vendorRow = this.getVendorRow(vendorNameOrCode);
    await vendorRow.rejectBtn.click();
    await this.rejectRemarksInput.fill(remarks);
    await this.rejectConfirmBtn.click();
  }

  /**
   * Opens the View Details modal for a vendor and approves.
   */
  async approveFromDetailsModal(vendorNameOrCode: string): Promise<void> {
    const vendorRow = this.getVendorRow(vendorNameOrCode);
    await vendorRow.viewBtn.click();
    await this.detailsApproveBtn.click();
    await this.approveConfirmBtn.click();
  }

  /**
   * Opens the View Details modal for a vendor and rejects with remarks.
   */
  async rejectFromDetailsModal(vendorNameOrCode: string, remarks: string): Promise<void> {
    const vendorRow = this.getVendorRow(vendorNameOrCode);
    await vendorRow.viewBtn.click();
    await this.detailsRejectBtn.click();
    await this.rejectRemarksInput.fill(remarks);
    await this.rejectConfirmBtn.click();
  }

  /**
   * Reads and parses the numerical pending vendor count from the page.
   * Ensures the pendingCountText element is visible before reading innerText.
   * e.g. "4 vendors pending approval" -> returns 4.
   */
  async getPendingCount(): Promise<number> {
    await this.pendingCountText.waitFor({ state: 'visible' });
    const countText = await this.pendingCountText.innerText();
    const match = countText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}

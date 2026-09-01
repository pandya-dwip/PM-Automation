import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model (POM) Locator Class for Master Database (/master-table) and PO Generation (/generate-po).
 * Encapsulates Master Database toolbar buttons, selectable row checkboxes, PO generation triggers,
 * and Supplier Details vendor autocomplete search inputs.
 */
export class MasterDatabaseLocators {
  // Page Heading & Toolbar Buttons
  readonly pageHeading: Locator;
  readonly filtersBtn: Locator;
  readonly draftPoBtn: Locator;
  readonly cancelSelectedBtn: Locator;
  readonly manualPoBtn: Locator;
  readonly importPoBtn: Locator;
  readonly generatePoBtn: Locator;

  // DataGrid Row & Checkbox
  readonly dataGrid: Locator;
  readonly selectableCheckbox: Locator;

  // PO Generation Page (/generate-po) Locators
  readonly vendorAutocompleteInput: Locator;
  readonly noOptionsMessage: Locator;

  constructor(private readonly page: Page) {
    // Master Database Page (/master-table)
    this.pageHeading = this.page.getByRole('heading', { name: 'Master Database' });
    this.filtersBtn = this.page.getByTestId('master-db-filters-btn');
    this.draftPoBtn = this.page.getByTestId('master-db-draft-po-btn');
    this.cancelSelectedBtn = this.page.getByTestId('master-db-cancel-selected-btn');
    this.manualPoBtn = this.page.getByTestId('master-db-manual-po-btn');
    this.importPoBtn = this.page.getByTestId('master-db-import-po-btn');
    this.generatePoBtn = this.page.getByTestId('master-db-generate-po-btn');

    // DataGrid Table Container & First Enabled Row Checkbox Input
    this.dataGrid = this.page.getByTestId('master-db-grid').or(this.page.locator('.MuiDataGrid-root')).first();
    this.selectableCheckbox = this.page
      .locator('.MuiDataGrid-row input[type="checkbox"]:not([disabled]), input[name="select_row"]:not([disabled])')
      .first();

    // Generate PO Page (/generate-po) Autocomplete Locators
    this.vendorAutocompleteInput = this.page.getByPlaceholder('Search and select vendor…');
    this.noOptionsMessage = this.page.locator('.MuiAutocomplete-noOptions').or(this.page.getByText('No options'));
  }

  /**
   * Selects the first available enabled checkbox in the Master Database table.
   * Waits for DataGrid table rows to mount and render.
   */
  async selectFirstAvailableRow(): Promise<void> {
    await this.page.waitForSelector('.MuiDataGrid-row', { state: 'visible', timeout: 20000 });
    await this.selectableCheckbox.scrollIntoViewIfNeeded();
    await this.selectableCheckbox.check({ force: true });
  }

  /**
   * Clicks the Generate PO button to navigate to /generate-po.
   */
  async clickGeneratePo(): Promise<void> {
    await this.generatePoBtn.click();
  }

  /**
   * Fills search text into the Supplier Details vendor autocomplete input on /generate-po.
   *
   * @param vendorName Vendor Name to search in autocomplete dropdown
   */
  async searchVendorInPoDropdown(vendorName: string): Promise<void> {
    await this.vendorAutocompleteInput.click();
    await this.vendorAutocompleteInput.fill(vendorName);
  }

  /**
   * Gets autocomplete option locator matching vendorName.
   *
   * @param vendorName Vendor Name to match
   */
  getVendorOption(vendorName: string): Locator {
    return this.page
      .locator('.MuiAutocomplete-option, li[role="option"]')
      .filter({ hasText: new RegExp(vendorName, 'i') })
      .first();
  }
}

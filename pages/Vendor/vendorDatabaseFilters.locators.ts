import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model (POM) Locator Class for the Vendor Database Filter Drawer on /vendor-data.
 */
export class VendorDatabaseFiltersLocators {
  // Filter Trigger Button
  readonly filtersBtn: Locator;

  // Drawer / Side Panel Container
  readonly filterDrawer: Locator;

  // Filter Input Controls
  readonly productCategoryInput: Locator;
  readonly productCategoryOptions: Locator;

  readonly hasDocsSelect: Locator;
  readonly hasDocsTrigger: Locator;
  readonly hasDocsOptionAll: Locator;
  readonly hasDocsOptionWithDocs: Locator;
  readonly hasDocsOptionWithoutDocs: Locator;

  readonly accountsApprovalSelect: Locator;
  readonly accountsApprovalTrigger: Locator;
  readonly accountsOptionAll: Locator;
  readonly accountsOptionPending: Locator;
  readonly accountsOptionApproved: Locator;
  readonly accountsOptionRejected: Locator;

  // Action Buttons
  readonly applyFiltersBtn: Locator;
  readonly resetFiltersBtn: Locator;
  readonly closeDrawerBtn: Locator;

  // Missing Document Element
  readonly missingDocBadge: Locator;

  constructor(private readonly page: Page) {
    // Filter Button on the Table Toolbar
    this.filtersBtn = this.page.getByTestId('vendor-data-filters-btn');

    // Drawer Container
    this.filterDrawer = this.page.locator('.MuiDrawer-root, [role="presentation"]').filter({
      has: this.page.getByTestId('vendor-data-filters-apply-btn'),
    });

    // 1. Product Category (MUI Autocomplete / Combobox)
    this.productCategoryInput = this.page.getByTestId('vendor-data-filter-category');
    this.productCategoryOptions = this.page.locator('.MuiAutocomplete-popper li, [role="option"]');

    // 2. Has Documents (MUI Select)
    this.hasDocsSelect = this.page.getByTestId('vendor-data-filter-docs');
    this.hasDocsTrigger = this.hasDocsSelect.locator('..').locator('[role="combobox"]');
    this.hasDocsOptionAll = this.page.locator('li[role="option"]').filter({ hasText: /All Vendors/i });
    this.hasDocsOptionWithDocs = this.page.locator('li[role="option"]').filter({ hasText: /With Documents/i });
    this.hasDocsOptionWithoutDocs = this.page.locator('li[role="option"]').filter({ hasText: /Without Documents/i });

    // 3. Accounts Approval (MUI Select)
    this.accountsApprovalSelect = this.page.getByTestId('vendor-data-filter-accounts');
    this.accountsApprovalTrigger = this.accountsApprovalSelect.locator('..').locator('[role="combobox"]');
    this.accountsOptionAll = this.page.locator('li[role="option"]').filter({ hasText: /All Statuses/i });
    this.accountsOptionPending = this.page.locator('li[role="option"]').filter({ hasText: /^Pending$/i });
    this.accountsOptionApproved = this.page.locator('li[role="option"]').filter({ hasText: /^Approved$/i });
    this.accountsOptionRejected = this.page.locator('li[role="option"]').filter({ hasText: /^Rejected$/i });

    // Action Buttons
    this.applyFiltersBtn = this.page.getByTestId('vendor-data-filters-apply-btn');
    this.resetFiltersBtn = this.page.getByTestId('vendor-data-filters-reset-btn');
    this.closeDrawerBtn = this.page.getByTestId('vendor-data-filters-drawer-close-btn');

    // Missing Document Not Available Badge
    this.missingDocBadge = this.page.getByTestId('vendor-data-download-missing');
  }

  /**
   * Opens the Filter Drawer by clicking the Filters button.
   */
  async openFilterDrawer(): Promise<void> {
    await this.filtersBtn.click();
    await this.applyFiltersBtn.waitFor({ state: 'visible' });
  }

  /**
   * Closes the Filter Drawer by clicking the Close button.
   */
  async closeFilterDrawer(): Promise<void> {
    await this.closeDrawerBtn.click();
    await this.applyFiltersBtn.waitFor({ state: 'hidden' });
  }

  /**
   * Filters by Product Category.
   *
   * @param category Product Category name (e.g. 'Test Electronics Category')
   */
  async filterByCategory(category: string): Promise<void> {
    await this.productCategoryInput.fill(category);
    const option = this.productCategoryOptions.filter({ hasText: new RegExp(category, 'i') }).first();
    if (await option.count() > 0 && await option.isVisible()) {
      await option.click();
    }
  }

  /**
   * Filters by Document Status.
   *
   * @param option 'all' | 'yes' | 'no' (or 'With Documents' | 'Without Documents')
   */
  async filterByDocs(option: 'all' | 'yes' | 'no' | 'With Documents' | 'Without Documents'): Promise<void> {
    await this.hasDocsTrigger.click();
    if (option === 'yes' || option === 'With Documents') {
      await this.hasDocsOptionWithDocs.click();
    } else if (option === 'no' || option === 'Without Documents') {
      await this.hasDocsOptionWithoutDocs.click();
    } else {
      await this.hasDocsOptionAll.click();
    }
  }

  /**
   * Filters by Accounts Approval Status.
   *
   * @param status 'all' | 'pending' | 'approved' | 'rejected'
   */
  async filterByAccountsApproval(
    status: 'all' | 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected'
  ): Promise<void> {
    await this.accountsApprovalTrigger.click();
    const normalized = status.toLowerCase();
    if (normalized === 'pending') {
      await this.accountsOptionPending.click();
    } else if (normalized === 'approved') {
      await this.accountsOptionApproved.click();
    } else if (normalized === 'rejected') {
      await this.accountsOptionRejected.click();
    } else {
      await this.accountsOptionAll.click();
    }
  }

  /**
   * Clicks 'Apply Filters' button to apply the selected filters and close the side panel.
   */
  async applyFilters(): Promise<void> {
    await this.applyFiltersBtn.click();
    await this.applyFiltersBtn.waitFor({ state: 'hidden' });
  }

  /**
   * Clicks 'Reset Filters' button to clear all filters.
   */
  async resetFilters(): Promise<void> {
    await this.resetFiltersBtn.click();
  }
}

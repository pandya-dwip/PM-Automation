import { Page, Locator } from '@playwright/test';
import { ENDPOINTS } from '../../helpers/endpoints';

export class HeaderNavigationLocators {
  // Top-Level Navigation Module Buttons
  readonly navContainer: Locator;
  readonly homeBtn: Locator;
  readonly requisitionsBtn: Locator;
  readonly storeBtn: Locator;
  readonly purchaseBtn: Locator;
  readonly manufacturingOrderBtn: Locator;
  readonly vendorBtn: Locator;
  readonly componentsBtn: Locator;
  readonly qualityBtn: Locator;
  readonly adminBtn: Locator;

  // User Profile & Logout Locators
  readonly userProfileTrigger: Locator;
  readonly logoutMenuItem: Locator;

  // Requisitions Sub-menu items
  readonly requisitions: {
    newIndent: Locator;
    createItem: Locator;
    editIndentMyIndent: Locator;
    approveIndent: Locator;
  };

  // Store Sub-menu items
  readonly store: {
    inward: Locator;
    inwardEdit: Locator;
    inwardApproval: Locator;
    invoiceTracker: Locator;
    verification: Locator;
    rejectedMaterial: Locator;
    gatePass: Locator;
    inventory: Locator;
    issueQty: Locator;
    allocateStock: Locator;
    stockJv: Locator;
  };

  // Purchase Sub-menu items
  readonly purchase: {
    masterDatabase: Locator;
    poDatabase: Locator;
    poSummary: Locator;
    poReport: Locator;
    poLineItems: Locator;
    poApproval: Locator;
    poEdit: Locator;
  };

  // Manufacturing Order Sub-menu items
  readonly manufacturingOrder: {
    masterDatabaseMo: Locator;
    bomCreation: Locator;
    bomDatabase: Locator;
    moDatabase: Locator;
    mrp: Locator;
    moApproval: Locator;
    moEdit: Locator;
    moLineItems: Locator;
  };

  // Vendor Sub-menu items
  readonly vendor: {
    registration: Locator;
    approval: Locator;
    edit: Locator;
    database: Locator;
  };

  // Components Sub-menu items
  readonly components: {
    itemMaster: Locator;
    itemApproval: Locator;
    itemSubmitter: Locator;
  };

  // Quality Sub-menu items
  readonly quality: {
    qcPending: Locator;
    qualityOrders: Locator;
    qcReports: Locator;
    qualityPlans: Locator;
    qcAssignments: Locator;
  };

  // Admin Sub-menu items
  readonly admin: {
    adminDashboard: Locator;
  };

  constructor(private readonly page: Page) {
    // Header Buttons (using exact: true to avoid substring matches with form action buttons)
    this.navContainer = this.page.locator('nav.top-navigation');
    this.homeBtn = this.page.getByRole('button', { name: 'Home', exact: true });
    this.requisitionsBtn = this.page.getByRole('button', { name: 'Requisitions', exact: true });
    this.storeBtn = this.page.getByRole('button', { name: 'Store', exact: true });
    this.purchaseBtn = this.page.getByRole('button', { name: 'Purchase', exact: true });
    this.manufacturingOrderBtn = this.page.getByRole('button', { name: 'Manufacturing Order', exact: true });
    this.vendorBtn = this.page.getByRole('button', { name: 'Vendor', exact: true });
    this.componentsBtn = this.page.getByRole('button', { name: 'Components', exact: true });
    this.qualityBtn = this.page.getByRole('button', { name: 'Quality', exact: true });
    this.adminBtn = this.page.getByRole('button', { name: 'Admin', exact: true });

    // User Profile & Logout Locators
    this.userProfileTrigger = this.page.locator('.user-profile-trigger');
    this.logoutMenuItem = this.page.getByRole('menuitem', { name: 'Logout' });

    // Requisitions Sub-menu Items
    this.requisitions = {
      newIndent: this.page.getByRole('button', { name: 'New Indent' }),
      createItem: this.page.getByRole('button', { name: 'Create Item' }),
      editIndentMyIndent: this.page.getByRole('button', { name: 'Edit Indent / My Indent' }),
      approveIndent: this.page.getByRole('button', { name: 'Approve Indent' }),
    };

    // Store Sub-menu Items
    this.store = {
      inward: this.page.getByRole('button', { name: 'Inward', exact: true }),
      inwardEdit: this.page.getByRole('button', { name: 'Inward Edit' }),
      inwardApproval: this.page.getByRole('button', { name: 'Inward Approval' }),
      invoiceTracker: this.page.getByRole('button', { name: 'Invoice Tracker' }),
      verification: this.page.getByRole('button', { name: 'Verification' }),
      rejectedMaterial: this.page.getByRole('button', { name: 'Rejected Material' }),
      gatePass: this.page.getByRole('button', { name: 'Gate Pass' }),
      inventory: this.page.getByRole('button', { name: 'Inventory' }),
      issueQty: this.page.getByRole('button', { name: 'Issue Qty' }),
      allocateStock: this.page.getByRole('button', { name: 'Allocate Stock' }),
      stockJv: this.page.getByRole('button', { name: 'Stock JV' }),
    };

    // Purchase Sub-menu Items
    this.purchase = {
      masterDatabase: this.page.getByRole('button', { name: 'Master Database' }).first(),
      poDatabase: this.page.getByRole('button', { name: 'PO Database' }),
      poSummary: this.page.getByRole('button', { name: 'PO Summary' }),
      poReport: this.page.getByRole('button', { name: 'PO Report' }),
      poLineItems: this.page.getByRole('button', { name: 'PO Line Items' }),
      poApproval: this.page.getByRole('button', { name: 'PO Approval' }),
      poEdit: this.page.getByRole('button', { name: 'PO Edit' }),
    };

    // Manufacturing Order Sub-menu Items
    this.manufacturingOrder = {
      masterDatabaseMo: this.page.getByRole('button', { name: 'Master Database (MO)' }),
      bomCreation: this.page.getByRole('button', { name: 'BOM Creation' }),
      bomDatabase: this.page.getByRole('button', { name: 'BOM Database' }),
      moDatabase: this.page.getByRole('button', { name: 'MO Database' }),
      mrp: this.page.getByRole('button', { name: 'MRP' }),
      moApproval: this.page.getByRole('button', { name: 'MO Approval' }),
      moEdit: this.page.getByRole('button', { name: 'MO Edit' }),
      moLineItems: this.page.getByRole('button', { name: 'MO Line Items' }),
    };

    // Vendor Sub-menu Items
    this.vendor = {
      registration: this.page.locator('.nav-mega-link', { hasText: 'Registration' }).or(this.page.getByRole('button', { name: 'Registration' })).first(),
      approval: this.page.locator('.nav-mega-link', { hasText: 'Approval' }).or(this.page.getByRole('button', { name: 'Approval' })).first(),
      edit: this.page.locator('.nav-mega-link', { hasText: 'Edit' }).or(this.page.getByRole('button', { name: 'Edit' })).first(),
      database: this.page.locator('.nav-mega-link', { hasText: 'Database' }).or(this.page.getByRole('button', { name: 'Database' })).first(),
    };

    // Components Sub-menu Items
    this.components = {
      itemMaster: this.page.getByRole('button', { name: 'Item Master' }),
      itemApproval: this.page.getByRole('button', { name: 'Item Approval' }),
      itemSubmitter: this.page.getByRole('button', { name: 'Item Submitter' }),
    };

    // Quality Sub-menu Items
    this.quality = {
      qcPending: this.page.getByRole('button', { name: 'QC Pending' }),
      qualityOrders: this.page.getByRole('button', { name: 'Quality Orders' }),
      qcReports: this.page.getByRole('button', { name: 'QC Reports' }),
      qualityPlans: this.page.getByRole('button', { name: 'Quality Plans' }),
      qcAssignments: this.page.getByRole('button', { name: 'QC Assignments' }),
    };

    // Admin Sub-menu Items
    this.admin = {
      adminDashboard: this.page.getByRole('button', { name: 'Admin Dashboard' }),
    };
  }

  /**
   * Navigates to the Requisition New Indent page via desktop menu or responsive drawer.
   */
  async navigateToNewIndent(): Promise<void> {
    const hamburger = this.page.getByRole('button', { name: 'Open navigation menu' });
    // Wait briefly to allow layout to settle
    await this.page.waitForTimeout(500);

    if (await hamburger.isVisible().catch(() => false)) {
      await hamburger.click();
      await this.page.waitForTimeout(300);
      const reqBtn = this.page.getByRole('button', { name: /Requisition/i }).first();
      if (await reqBtn.isVisible().catch(() => false)) {
        await reqBtn.click();
      }
      const newIndentBtn = this.page
        .getByRole('button', { name: 'New Indent' })
        .or(this.page.getByText('New Indent', { exact: true }))
        .first();
      await newIndentBtn.click();
    } else {
      const reqBtn = this.page.getByRole('button', { name: /Requisition/i }).first();
      await reqBtn.hover();
      await this.page.waitForTimeout(300);
      const newIndentBtn = this.page
        .getByRole('button', { name: 'New Indent' })
        .or(this.page.getByText('New Indent', { exact: true }))
        .first();
      await newIndentBtn.click();
    }
  }

  /**
   * Perform UI profile avatar click and Logout menu item selection.
   */
  async performUiLogout(): Promise<void> {
    await this.userProfileTrigger.click();
    await this.logoutMenuItem.click();
    await this.page.waitForURL(`**${ENDPOINTS.AUTH.LOGIN}**`);
  }

  /**
   * Dynamically locate any sub-menu button by name.
   */
  getSubMenuButton(buttonName: string, exact = false): Locator {
    return this.page.getByRole('button', { name: buttonName, exact });
  }
}


/**
 * Global application route paths and endpoints.
 * These relative paths append to the baseURL configured in playwright.config.ts.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/',
  },
  HOME: '/home',
  REQUISITIONS: {
    NEW_INDENT: '/requisition-form',
    EDIT_INDENT: '/edit-requisition',
    APPROVE_INDENT: '/approval-table',
    CREATE_ITEM: '/item-generator',
  },
  STORE: {
    INWARD: '/inward',
    INWARD_EDIT: '/edit-inward',
    INWARD_APPROVAL: '/inward-approval',
    INVOICE_TRACKER: '/invoice-tracker',
    VERIFICATION: '/requisition-verification',
    REJECTED_MATERIAL: '/rejected-materials',
    GATE_PASS: '/gatepass',
    INVENTORY: '/inventory',
    ISSUE_QTY: '/outward',
    ALLOCATE_STOCK: '/allocate',
    STOCK_JV: '/stock-jv',
  },
  PURCHASE: {
    MASTER_DATABASE: {
      MAIN: '/master-table',
      GENERATE_PO: '/generate-po',
    },
    PO_DATABASE: '/PO',
    PO_SUMMARY: '/po-summary',
    PO_REPORT: '/po-report',
    PO_LINE_ITEMS: '/po-line-items',
    PO_APPROVAL: '/po-approval',
    PO_EDIT: '/po-edit',
  },
  MANUFACTURING_ORDER: {
    MASTER_DATABASE_MO: '/master-database-mo',
    BOM_CREATION: '/bom-creation',
    BOM_DATABASE: '/bom-database',
    MO_DATABASE: '/wo-database',
    MRP: '/mrp-report',
    MO_APPROVAL: '/wo-approval',
    MO_EDIT: '/wo-edit',
    MO_LINE_ITEMS: '/wo-line-items',
  },
  VENDOR: {
    REGISTRATION: '/vendor-registration',
    APPROVAL: '/vendor-approval',
    EDIT: '/vendor-edit',
    DATABASE: '/vendor-data',
  },
  COMPONENTS: {
    ITEM_MASTER: '/item-data',
    ITEM_APPROVAL: '/item-approval',
    ITEM_SUBMITTER: '/item-submitter',
  },
  QUALITY: {
    QC_PENDING: '/quality-pending',
    QUALITY_ORDERS: '/quality-orders',
    QC_REPORTS: '/quality-reports',
    QUALITY_PLANS: '/quality-plans',
    QC_ASSIGNMENTS: '/quality-assignments',
  },
  ADMIN: {
    ADMIN_DASHBOARD: '/admin',
  },
} as const;

# 🏢 Vendor Management Automation — Master Test Specification & Documentation

Comprehensive Playwright test automation specification covering end-to-end workflows, role-based access control, field-level validations, duplicate prevention, document handling, state machines, filter drawer interactions, and cross-module validations for the **Vendor Management Module**.

---

## 📑 Table of Contents

1. [👥 Roles, Credentials & Permissions](#-roles-credentials--permissions)
2. [🗺️ Application Endpoints & Routing](#️-application-endpoints--routing)
3. [📋 Form Fields, Locators & Validation Rules](#-form-fields-locators--validation-rules)
4. [📎 Document Uploads & Validation Constraints](#-document-uploads--validation-constraints)
5. [🔔 Centralized Toast Alert Messages Directory](#-centralized-toast-alert-messages-directory)
6. [🗂️ Page Object Model (POM) Locators Dictionary](#️-page-object-model-pom-locators-dictionary)
7. [🧪 Detailed Test Suites Specification (14 Suites)](#-detailed-test-suites-specification-14-suites)
   - [1. Vendor Registration Suite (`VendorRegistration.spec.ts`)](#1-vendor-registration-suite-vendorregistrationspects)
   - [2. Duplicate Vendor Validation Suite (`VendorDuplicateValidation.spec.ts`)](#2-duplicate-vendor-validation-suite-vendorduplicatevalidationspects)
   - [3. Developer Approval Queue Suite (`VendorApproval.spec.ts`)](#3-developer-approval-queue-suite-vendorapprovalspects)
   - [4. Vendor Details Verification Suite (`VendorVerification.spec.ts`)](#4-vendor-details-verification-suite-vendorverificationspects)
   - [5. View Details Modal Actions Suite (`VendorModalActions.spec.ts`)](#5-view-details-modal-actions-suite-vendormodalactionspects)
   - [6. Developer Vendor Rejection Suite (`VendorRejection.spec.ts`)](#6-developer-vendor-rejection-suite-vendorrejectionspects)
   - [7. Vendor Information Edit Suite (`VendorEdit.spec.ts`)](#7-vendor-information-edit-suite-vendoreditspects)
   - [8. Vendor Database Grid Suite (`VendorDatabase.spec.ts`)](#8-vendor-database-grid-suite-vendordatabasespects)
   - [9. Vendor Database Filter Drawer Suite (`VendorDatabaseFilters.spec.ts`)](#9-vendor-database-filter-drawer-suite-vendordatabasefiltersspects)
   - [10. Accounts Team Approval Flow (`VendorAccountsApprovalFlow.spec.ts`)](#10-accounts-team-approval-flow-vendoraccountsapprovalflowspects)
   - [11. Accounts Team Rejection Flow (`VendorAccountsRejectionFlow.spec.ts`)](#11-accounts-team-rejection-flow-vendoraccountsrejectionflowspects)
   - [12. Accounts Conditional Re-Edit & Reset Flow (`VendorAccountsConditionalFlow.spec.ts`)](#12-accounts-conditional-re-edit--reset-flow-vendoraccountsconditionalflowspects)
   - [13. Purchase Order Vendor Integration Suite (`VendorPoVerification.spec.ts`)](#13-purchase-order-vendor-integration-suite-vendorpoverificationspects)
   - [14. Master Full Lifecycle End-to-End Suite (`VendorFullLifecycle.spec.ts`)](#14-master-full-lifecycle-end-to-end-suite-vendorfulllifecyclespects)
8. [🚀 Test Execution Reference](#-test-execution-reference)

---

## 👥 Roles, Credentials & Permissions

| Role Identifier | Username | Password | Base Landing | Responsibilities & Access Scope |
|---|---|---|---|---|
| **Developer / Procurement** (`USER_ROLES.DEVELOPER`) | `disha` | `disha@123` | `/home` | • Vendor Registration (`/vendor-registration`)<br>• Level-1 Vendor Approval/Rejection (`/vendor-approval`)<br>• Vendor Modification across tabs (`/vendor-edit`)<br>• Vendor Database viewing (`/vendor-data`) |
| **Accounts Team** (`USER_ROLES.ACCOUNTS`) | `invoice` | `cimcon@123` | `/home` | • Level-2 Vendor Final Approval & Rejection (`/vendor-data`)<br>• Accounts Remark Submissions<br>• Vendor Database Filtering & CSV/Excel Export |

---

## 🗺️ Application Endpoints & Routing

```typescript
export const ENDPOINTS = {
  AUTH: { LOGIN: '/' },
  HOME: '/home',
  VENDOR: {
    REGISTRATION: '/vendor-registration', // New Vendor Form & Document Uploads
    APPROVAL:     '/vendor-approval',     // Level-1 Developer Approval Queue
    EDIT:         '/vendor-edit',         // Multi-Tab Edit & State Workspace
    DATABASE:     '/vendor-data',         // Master DataGrid & Level-2 Accounts Actions
  },
  PURCHASE: {
    GENERATE_PO: '/generate-po',          // Purchase Order Creation Integration
  }
};
```

---

## 📋 Form Fields, Locators & Validation Rules

| Field Label | HTML Input Locator / Selector | Type | Mandatory? | Format / Validation Constraints | Error Behavior / Highlight |
|---|---|:---:|:---:|---|---|
| **Product Category** | `input[name="product_category"]` | Text / Autocomplete | **Yes** | Alphanumeric string | Red border, focus error outline |
| **Vendor Name** | `input[name="vendor_name"]` | Text | **Yes** | Unique business entity name | Duplicate check blocked (`DUPLICATE_VENDOR_NAME`) |
| **Contact Person** | `input[name="contact_person"]` | Text | **Yes** | Full name string | Required field toast alert |
| **Mobile Number 1** | `input[name="mobile_no_1"]` | Tel / Number | **Yes** | Exactly 10 digits (`^\d{10}$`) | Required field toast alert |
| **Mobile Number 2** | `input[name="mobile_no_2"]` | Tel / Number | Optional | Optional 10 digits | Validated only when entered |
| **Primary Email (1)**| `input[name="email_1"]` | Email | **Yes** | Valid email regex (`user@domain.com`) | Required field toast alert |
| **Secondary Email (2)**| `input[name="email_2"]` | Email | Optional | Optional valid email regex | Validated only when entered |
| **Company Website** | `input[name="website"]` | URL | Optional | Valid URL (`https://...`) | Optional format validation |
| **MSME Registered** | `div[id="mui-component-select-is_msme"]` | Select | **Yes** | `'Yes'` / `'No'` boolean selection | Defaults to `'No'` |
| **GST Number** | `input[name="gst_number"]` | Text | **Yes** | 15-character GSTIN regex | Duplicate check blocked (`DUPLICATE_GST`) |
| **PAN Number** | `input[name="pan_number"]` | Text | **Yes** | 10-character PAN regex (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`) | Duplicate check blocked (`DUPLICATE_PAN`) |
| **State** | `input[name="state"]` | Text | **Yes** | State / Territory name string | Required field toast alert |
| **State Code** | `input[name="state_code"]` | Number | **Yes** | 2-digit Indian State code (e.g. `24`, `27`) | Required field toast alert |
| **Address** | `textarea[name="address"]` | Textarea | **Yes** | Detailed street address | Required field toast alert |

---

## 📎 Document Uploads & Validation Constraints

| Document Name | Input Selector | Accepted Formats | Mandatory? | Table Column Cell | Download Selector / Missing Badge |
|---|---|:---:|:---:|---|---|
| **PAN Card** | `input[name="pan_card"]` | `.pdf` | **Yes** | `[data-field="pan_card"]` | `[data-testid="vendor-data-download-btn"]` |
| **GST Certificate** | `input[name="gst_certificate"]` | `.pdf` | **Yes** | `[data-field="gst_certificate"]` | `[data-testid="vendor-data-download-btn"]` |
| **Cancelled Cheque** | `input[name="cancelled_cheque"]` | `.pdf`, `.jpg`, `.jpeg`, `.png` | **Yes** | `[data-field="cancelled_cheque"]` | `[data-testid="vendor-data-download-btn"]` |
| **Vendor Registration Form** | `input[name="vendor_reg_form"]` | `.pdf` | **Yes** | `[data-field="vendor_reg_form"]` | `[data-testid="vendor-data-download-btn"]` |
| **TAN Allotment Letter** | `input[name="tan_allotment_letter"]` | `.pdf` | Optional | `[data-field="tan_allotment_letter"]` | `[data-testid="vendor-data-download-btn"]` / `[data-testid="vendor-data-download-missing"]` |
| **Incorporation Certificate** | `input[name="incorporation_certificate"]` | `.pdf` | Optional | `[data-field="incorporation_certificate"]` | `[data-testid="vendor-data-download-btn"]` / `[data-testid="vendor-data-download-missing"]` |
| **MSME / UDYAM Certificate** | `input[name="udyam_certificate_msme"]` | `.pdf` | Optional | `[data-field="udyam_certificate_msme"]` | `[data-testid="vendor-data-download-btn"]` / `[data-testid="vendor-data-download-missing"]` |

---

## 🔔 Centralized Toast Alert Messages Directory

Source: [`helpers/toast-messages.ts`](file:///d:/Purchase%20Module/PM-Automation/helpers/toast-messages.ts)

```typescript
export const TOAST_MESSAGES = {
  VENDOR: {
    // ── 1. Lifecycle & Action Success ──────────────────────────────────────────
    REGISTERED_SUCCESS: 'Vendor registered successfully!',
    REJECTED_SUCCESS:   'Vendor rejected successfully',
    APPROVED_SUCCESS:   'Vendor approved successfully',
    EDITED_SUCCESS:     'Vendor information updated and submitted for approval!',
    EXPORT_SUCCESS:     'Export completed successfully',

    // ── 2. Document Downloads ──────────────────────────────────────────────────
    DOWNLOAD_PAN_CARD:          'PAN Card downloaded successfully',
    DOWNLOAD_GST_CERTIFICATE:   'GST Certificate downloaded successfully',
    DOWNLOAD_INCORPORATION:     'Incorporation Certificate downloaded successfully',
    DOWNLOAD_CANCELLED_CHEQUE:  'Cancelled Cheque downloaded successfully',
    DOWNLOAD_TAN_LETTER:        'TAN Allotment Letter downloaded successfully',
    DOWNLOAD_MSME_CERTIFICATE:  'MSME Certificate downloaded successfully',
    DOWNLOAD_REG_FORM:          'Vendor Registration Form downloaded successfully',

    // ── 3. Duplicate Validation ────────────────────────────────────────────────
    DUPLICATE_GST:          'A vendor with this GST number already exists.',
    DUPLICATE_PAN:          'A vendor with this PAN number already exists.',
    DUPLICATE_VENDOR_NAME:  'A vendor with this name already exists.',

    // ── 4. Missing Fields & Format Validation ──────────────────────────────────
    MISSING_FIELDS_AND_DOCUMENTS:
      'Missing fields: Product Category, Vendor Name, Contact Person, Mobile Number 1, Email 1, Address, GST Number, PAN Number, State, State Code, MSME. Missing documents: PAN Card, GST Certificate, Cancelled Cheque, Vendor Registration Form',
    INVALID_FORMAT_PDF_ONLY: 'Only PDF format is allowed for document uploads.',
    INVALID_FORMAT_CHEQUE:   'Only PDF, JPG, JPEG, or PNG format is allowed for Cancelled Cheque.',
  },
} as const;
```

---

## 🗂️ Page Object Model (POM) Locators Dictionary

### 1. Vendor Registration (`pages/Vendor/vendorRegistration.locators.ts`)
- **Submit Button**: `button[type="submit"], [data-testid="vendor-register-submit-btn"]`
- **Toast Alert**: `.MuiAlert-message, [role="alert"]`

### 2. Vendor Approval (`pages/Vendor/vendorApproval.locators.ts`)
- **Pending Count Badge**: `[data-testid="vendor-approval-count"], .MuiBadge-badge`
- **Search Input**: `input[placeholder*="Search"], [data-testid="vendor-approval-search"]`
- **Table Rows**: `table tbody tr, .MuiDataGrid-row`
- **Approve Button**: `[data-testid="vendor-approve-btn"]`
- **Reject Button**: `[data-testid="vendor-reject-btn"]`
- **View Details Button**: `[data-testid="vendor-view-details-btn"]`
- **Confirmation Dialogs**: `div[role="dialog"]`
- **Rejection Remarks**: `textarea[name="rejection_remarks"], textarea[name="remarks"]`

### 3. Vendor Edit (`pages/Vendor/vendorEdit.locators.ts`)
- **Tabs**:
  - Pending: `[data-testid="vendor-edit-tab-pending"]`
  - Approved: `[data-testid="vendor-edit-tab-approved"]`
  - Rejected: `[data-testid="vendor-edit-tab-rejected"]`
  - Accounts Rejected: `[data-testid="vendor-edit-tab-accounts-reject"]`
- **Search Input**: `input[data-testid="vendor-edit-search"]`
- **Edit Modal**: `div[role="dialog"]` (`Edit Vendor Details`)
- **Submit / Cancel**: `[data-testid="vendor-edit-submit-btn"]`, `[data-testid="vendor-edit-cancel-btn"]`

### 4. Vendor Database & Actions (`pages/Vendor/vendorDatabase.locators.ts`)
- **DataGrid Table**: `[data-testid="vendor-data-grid"], .MuiDataGrid-root`
- **Data Rows**: `.MuiDataGrid-row`
- **Export Button**: `[data-testid="vendor-data-export-btn"]`
- **Accounts Approve / Reject**: `[data-testid="vendor-data-approve-btn"]`, `[data-testid="vendor-data-reject-btn"]`
- **Status Chips**:
  - `[data-testid="vendor-data-status-pending"]` (Pending)
  - `[data-testid="vendor-data-status-approved"]` (Approved)
  - `[data-testid="vendor-data-status-rejected"]` (Rejected)
- **Document Download Buttons**: `[data-testid="vendor-data-download-btn"]`
- **Missing Document Indicator**: `[data-testid="vendor-data-download-missing"]` ("Not available")

### 5. Vendor Database Filters Drawer (`pages/Vendor/vendorDatabaseFilters.locators.ts`)
- **Filters Trigger Button**: `[data-testid="vendor-data-filters-btn"]`
- **Product Category**: `[data-testid="vendor-data-filter-category"]`
- **Has Documents Select**: `[data-testid="vendor-data-filter-docs"]` (`All Vendors`, `With Documents`, `Without Documents`)
- **Accounts Approval Select**: `[data-testid="vendor-data-filter-accounts"]` (`All Statuses`, `Pending`, `Approved`, `Rejected`)
- **Apply Filters**: `[data-testid="vendor-data-filters-apply-btn"]`
- **Reset Filters**: `[data-testid="vendor-data-filters-reset-btn"]`
- **Close Drawer**: `[data-testid="vendor-data-filters-drawer-close-btn"]`

---

## 🧪 Detailed Test Suites Specification (14 Suites)

### 1. Vendor Registration Suite (`VendorRegistration.spec.ts`)
- **Test 1: Incremental Validation, Randomized Document Uploads & Complete Registration**
  - **Endpoint**: `/vendor-registration` $\rightarrow$ `/vendor-approval` | **Role**: Developer
  - **Steps**:
    1. Submits empty form $\rightarrow$ asserts all 10 mandatory fields display error highlights; Toast displays `TOAST_MESSAGES.VENDOR.MISSING_FIELDS_AND_DOCUMENTS`.
    2. Incrementally fills 11 text/select fields $\rightarrow$ asserts error highlights and field names clear dynamically from toast.
    3. Verifies missing documents toast alert.
    4. **Randomized File Upload & MSME Selection**:
       - Randomizes `isMsme` (`Yes` / `No`). If `Yes` $\rightarrow$ attaches UDYAM Certificate.
       - Randomizes optional documents (`Incorporation Certificate` and `TAN Allotment Letter`): uploads **both**, **only 1**, or **none**.
       - Mandatory documents (`PAN Card`, `GST Certificate`, `Cancelled Cheque`, `Vendor Registration Form`) are always attached.
    5. Submits registration $\rightarrow$ asserts success toast `TOAST_MESSAGES.VENDOR.REGISTERED_SUCCESS`.
    6. **Approval Queue Document Count & Modal Verification** (`/vendor-approval`):
       - Asserts table document column badge matches uploaded document count and text displays `X/Y docs` (e.g. `5/6 docs`, `6/7 docs`, `7/7 docs`).
       - Opens **View Details** modal $\rightarrow$ asserts header displays `Documents (X/Y)`.
       - Validates **Download** chip (`.MuiChip-colorSuccess`) for each uploaded document and **Missing** chip (`.MuiChip-colorError`) for each omitted optional document.
- **Test 2: Invalid File Format Rejection**
  - **Steps**: Uploads `.exe` / `.txt` / `.xlsx` to document inputs $\rightarrow$ asserts format validation error toasts (`INVALID_FORMAT_PDF_ONLY`, `INVALID_FORMAT_CHEQUE`).
- **Test 3: Duplicate Vendor Validation & Shared Mobile**
  - **Steps**: Verifies duplicate checks for GST, PAN, Company Name, and allows shared contact numbers.

---

### 2. Duplicate Vendor Validation Suite (`VendorDuplicateValidation.spec.ts`)
- **Test 1: Duplicate GST Number Rejection**
  - **Steps**: Registers vendor with an existing GST number.
  - **Expected Outcome**: Submission blocked; Toast displays `TOAST_MESSAGES.VENDOR.DUPLICATE_GST`.
- **Test 2: Duplicate PAN Number Rejection**
  - **Steps**: Registers vendor with an existing PAN number.
  - **Expected Outcome**: Submission blocked; Toast displays `TOAST_MESSAGES.VENDOR.DUPLICATE_PAN`.
- **Test 3: Duplicate Vendor Name Rejection**
  - **Steps**: Registers vendor with an existing Company Name.
  - **Expected Outcome**: Submission blocked; Toast displays `TOAST_MESSAGES.VENDOR.DUPLICATE_VENDOR_NAME`.
- **Test 4: Shared Contact Number Support**
  - **Steps**: Registers vendor with a mobile number already used by another entity.
  - **Expected Outcome**: Registration succeeds cleanly (shared contact numbers are permitted).

---

### 3. Developer Approval Queue Suite (`VendorApproval.spec.ts`)
- **Test 1: Approval Queue Count Decrement**
  - **Endpoint**: `/vendor-approval` | **Role**: Developer
  - **Steps**: Captures initial count $\rightarrow$ searches dynamic vendor $\rightarrow$ clicks Approve $\rightarrow$ confirms dialog.
  - **Expected Outcome**: Toast displays `TOAST_MESSAGES.VENDOR.APPROVED_SUCCESS`; count decreases by 1 (`initialCount - 1`).
- **Test 2: Search & Auto-Filtering**
  - **Steps**: Types vendor query in search input.
  - **Expected Outcome**: Table filters instantly to matching rows.

---

### 4. Vendor Details Verification Suite (`VendorVerification.spec.ts`)
- **Test 1: View Details Pre-Filled Field Verification**
  - **Endpoint**: `/vendor-approval` | **Role**: Developer
  - **Steps**: Clicks View Details button (`vendor-view-details-btn`).
  - **Expected Outcome**: Strictly validates all 10 text fields inside modal against original registration payload.
- **Test 2: Attached Document Download Buttons Visibility**
  - **Steps**: Inspects document section inside View Details modal.
  - **Expected Outcome**: Verifies download icons for all 7 attached files are present and visible.

---

### 5. View Details Modal Actions Suite (`VendorModalActions.spec.ts`)
- **Test 1: Modal Direct Approve Action**
  - **Steps**: Opens View Details $\rightarrow$ clicks Approve inside modal $\rightarrow$ confirms.
  - **Expected Outcome**: Vendor approved; queue count decrements.
- **Test 2: Modal Direct Reject Action with Mandatory Remarks**
  - **Steps**: Opens View Details $\rightarrow$ clicks Reject inside modal $\rightarrow$ enters remarks $\rightarrow$ confirms.
  - **Expected Outcome**: Vendor rejected; queue count decrements.

---

### 6. Developer Vendor Rejection Suite (`VendorRejection.spec.ts`)
- **Test 1: Developer Level Rejection Flow**
  - **Endpoint**: `/vendor-approval` | **Role**: Developer
  - **Steps**: Clicks Reject on vendor card $\rightarrow$ fills rejection reason $\rightarrow$ confirms.
  - **Expected Outcome**: Toast displays `TOAST_MESSAGES.VENDOR.REJECTED_SUCCESS`; queue count decrements.
- **Test 2: Empty Rejection Remarks Validation**
  - **Steps**: Leaves remarks field empty $\rightarrow$ attempts confirmation.
  - **Expected Outcome**: Submit button disabled / submission blocked.

---

### 7. Vendor Information Edit Suite (`VendorEdit.spec.ts`)
- **Test 1: Strict 13-Field Cross-Page Edit Verification**
  - **Endpoint**: `/vendor-edit` | **Role**: Developer
  - **Steps**: Opens Edit modal $\rightarrow$ updates 13 text fields + 6 files $\rightarrow$ submits.
  - **Expected Outcome**: Toast displays `TOAST_MESSAGES.VENDOR.EDITED_SUCCESS`; persisted values verified in re-opened modal and `/vendor-approval`.
- **Test 2: Cancel Edit Form & State Discarding**
  - **Steps**: Modifies fields $\rightarrow$ clicks Cancel/Close.
  - **Expected Outcome**: Modal closes; re-opened modal confirms original data was preserved.
- **Test 3: Tab Transition Verification**
  - **Steps**: Asserts cards move between `Pending`, `Approved`, `Rejected`, and `Accounts Rejected` tabs based on status.
- **Test 4: Search Clear & Table Recovery**
  - **Steps**: Searches query $\rightarrow$ clears input.
  - **Expected Outcome**: Full card list immediately recovers.

---

### 8. Vendor Database Grid Suite (`VendorDatabase.spec.ts`)
- **Test 1: DataGrid Columns & Virtual Scrolling Verification**
  - **Endpoint**: `/vendor-data` | **Role**: Developer / Accounts
  - **Steps**: Navigates to database $\rightarrow$ executes `scrollToRight()`.
  - **Expected Outcome**: All 16+ columns (Vendor ID, GST, PAN, Mobile, Documents, Status) render cleanly.
- **Test 2: Accounts Approval Status Chips**
  - **Steps**: Asserts status chips in DataGrid.
  - **Expected Outcome**: Verifies `Pending` (yellow), `Approved` (green), and `Rejected` (red) chips.
- **Test 3: Export to CSV/Excel Toast Validation**
  - **Steps**: Clicks Export button (`vendor-data-export-btn`).
  - **Expected Outcome**: Toast displays `TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS` (`"Export completed successfully"`).

---

### 9. Vendor Database Filter Drawer Suite (`VendorDatabaseFilters.spec.ts`)
- **Test 1: Lifecycle Status Filters**
  - **Steps**: Registers vendor (omitting optional Incorporation Certificate) $\rightarrow$ Developer approves $\rightarrow$ Filters `With Documents` + `Pending` $\rightarrow$ Accounts rejects $\rightarrow$ Filters `Rejected` $\rightarrow$ Developer re-edits without Incorporation $\rightarrow$ Developer re-approves $\rightarrow$ Asserts vendor is ABSENT from `Without Documents` filter, PRESENT under `With Documents` filter with `"Not available"` on Incorporation Certificate $\rightarrow$ Clicks all 6 active downloads $\rightarrow$ Accounts approves $\rightarrow$ Filters `Approved`.
  - **Expected Outcome**: Complete lifecycle transitions validated across filters.
- **Test 2: Drawer Controls & Reset**
  - **Steps**: Tests open/close, status filter auto-close on apply, and Reset Filters button.
  - **Expected Outcome**: Full table dataset restores cleanly upon reset.
- **Test 3: Document Availability Filters**
  - **Steps**: Filters `With Documents` (clicks download buttons), filters `Without Documents` (verifies `"Not available"` badges), resets to `All Vendors`.
- **Test 4: Search & Filter Integration**
  - **Steps**: Combines status filter (`Approved`) + search text query $\rightarrow$ clicks Export button.
  - **Expected Outcome**: Table intersects criteria; Toast displays `TOAST_MESSAGES.VENDOR.EXPORT_SUCCESS`.
- **Test 5: Empty State & Data Recovery**
  - **Steps**: Applies filter with non-matching query string.
  - **Expected Outcome**: DataGrid displays 0 data rows gracefully without table collapse; reset restores full dataset.

---

### 10. Accounts Team Approval Flow (`VendorAccountsApprovalFlow.spec.ts`)
- **Test 1: Accounts Level Approval**
  - **Endpoint**: `/vendor-data` | **Role**: Accounts (`invoice`)
  - **Steps**: Searches pending vendor $\rightarrow$ clicks Accounts Approve button $\rightarrow$ confirms dialog.
  - **Expected Outcome**: Vendor status chip updates to `Approved`.
- **Test 2: Accounts Dialog Verification**
  - **Steps**: Verifies modal details before approving.

---

### 11. Accounts Team Rejection Flow (`VendorAccountsRejectionFlow.spec.ts`)
- **Test 1: Accounts Level Rejection Execution**
  - **Endpoint**: `/vendor-data` | **Role**: Accounts (`invoice`)
  - **Steps**: Searches pending vendor $\rightarrow$ clicks Accounts Reject $\rightarrow$ fills rejection remarks $\rightarrow$ confirms.
  - **Expected Outcome**: Vendor status chip updates to `Rejected`.
- **Test 2: Mandatory Remarks Enforcement**
  - **Steps**: Asserts rejection cannot be confirmed without remarks.

---

### 12. Accounts Conditional Re-Edit & Reset Flow (`VendorAccountsConditionalFlow.spec.ts`)
- **Test 1: Accounts Rejected Tab Navigation & Re-Edit**
  - **Endpoint**: `/vendor-edit` | **Role**: Developer
  - **Steps**: Selects **Accounts Rejected Tab** (`vendor-edit-tab-accounts-reject`) $\rightarrow$ edits rejected vendor $\rightarrow$ submits.
  - **Expected Outcome**: Toast displays `TOAST_MESSAGES.VENDOR.EDITED_SUCCESS`.
- **Test 2: Developer Re-Approval & Status Reset to Pending**
  - **Steps**: Developer re-approves on `/vendor-approval` $\rightarrow$ navigates to `/vendor-data`.
  - **Expected Outcome**: Accounts status chip resets back to `Pending` for Accounts re-evaluation; Accounts approves vendor.

---

### 13. Purchase Order Vendor Integration Suite (`VendorPoVerification.spec.ts`)
- **Test 1: Approved Vendor Availability in PO Creation**
  - **Endpoint**: `/generate-po` | **Role**: Developer
  - **Steps**: Opens Vendor selection dropdown in PO creation.
  - **Expected Outcome**: Approved vendor appears in list; selecting auto-populates address and GST.
- **Test 2: Unapproved / Rejected Vendor Exclusion**
  - **Steps**: Searches pending or rejected vendors in PO creation dropdown.
  - **Expected Outcome**: Unapproved entities are excluded.

---

### 14. Master Full Lifecycle End-to-End Suite (`VendorFullLifecycle.spec.ts`)
Master 10-Phase integration test executing the complete end-to-end workflow:
1. **Phase 1**: Developer Login (`disha`).
2. **Phase 2**: Dynamic Registration with all 7 documents.
3. **Phase 3**: Pending status verification in `/vendor-edit`.
4. **Phase 4**: View Details verification on `/vendor-approval`.
5. **Phase 5**: Level-1 Developer rejection with remarks.
6. **Phase 6**: Rejection tab verification in `/vendor-edit`.
7. **Phase 7**: Re-edit 13 fields + documents and submit.
8. **Phase 8**: Developer approval on `/vendor-approval`.
9. **Phase 9**: Level-2 Accounts rejection $\rightarrow$ Developer re-edit from Accounts Rejected tab $\rightarrow$ Developer re-approval $\rightarrow$ status reset to Pending.
10. **Phase 10**: Accounts final approval $\rightarrow$ Fully Approved status verified across Database, Edit Approved tab, and PO Creation.

---

## 🚀 Test Execution Reference

```bash
# 1. Run entire Vendor test suite
npx playwright test tests/vendor/ --project=chromium

# 2. Run a specific test suite
npx playwright test tests/vendor/VendorDatabaseFilters.spec.ts --project=chromium
npx playwright test tests/vendor/VendorFullLifecycle.spec.ts --project=chromium

# 3. Run in interactive headed mode
npx playwright test tests/vendor/VendorDatabaseFilters.spec.ts --headed --project=chromium

# 4. Run with SlowMo for visual inspection
SLOWMO=350 npx playwright test tests/vendor/VendorFullLifecycle.spec.ts --headed --project=chromium

# 5. Open Playwright HTML Report
npx playwright show-report
```

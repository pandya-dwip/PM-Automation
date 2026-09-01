<div align="center">

# 🏭 Purchase Module (PM) QA Automation

**Enterprise End-to-End Test Automation Framework for CIMCON Purchase Module**

![Framework](https://img.shields.io/badge/framework-Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Architecture](https://img.shields.io/badge/architecture-Page%20Object%20Model%20(POM)-007ACC?style=flat-square)
![Test Runner](https://img.shields.io/badge/runner-Chromium-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Logging](https://img.shields.io/badge/logging-Structured%20Visual%20Logger-orange?style=flat-square)
![Validation](https://img.shields.io/badge/verification-Strict%20Exact%20Matching-success?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=flat-square&logo=nodedotjs&logoColor=white)

Robust, role-based, end-to-end automated test suites covering Requisitions, Vendor Onboarding, Multi-level Approvals, Database Grids, and PO Integrations.

</div>

---

## 🏗️ Architecture & Design Pattern

The test framework is built using **Playwright**, **TypeScript**, and a strict implementation of the **Page Object Model (POM)** architectural pattern.

### Architectural Highlights
- **Strict POM Separation**:  
  - **Locator Classes (`pages/`)**: Encapsulates UI element locators, field getters, and user interaction actions (`fill`, `click`, `upload`). Strictly **zero** `expect()` assertions inside page objects.
  - **Spec Files (`tests/`)**: Contains all flow orchestration, `test.step()` reporting blocks, structured logging, and `expect()` assertions.
- **Centralized Test Data Generators**:
  - `Data/Vendor/vendor-test-data.ts`: Generates unique, timestamped vendor names (`Test Vendor 1787568863241`), PAN, GST, email, and mobile numbers.
  - `Data/Requisitions/Indents/indent-test-data.ts`: Generates dynamic project codes (`PROJECT1483AUTO`), client names, and addresses.
- **Centralized Structured Execution Logging (`helpers/logger.ts`)**: Standardized logging utilities (`logHeader`, `logStep`, `logData`, `logSuccess`, `logFinish`) exported across all test specs produce clean, phase-by-phase console output with step trees (`├─ 🔹`), aligned key-value data dumps (`│    • Key : Value`), and success confirmations (`└── ✅`).
- **Sequential Execution Strategy**: Configured with `workers: 1` and `fullyParallel: false` in `playwright.config.ts` to maintain live backend state consistency across multi-step workflows.
- **Strict Verification Standards**:
  - Exact string matching (`{ exact: true }`) without loose regex substring matching.
  - Strict URL endpoint verification via `expectStrictEndpoint(page, endpoint)`.
- **Unified Helper Architecture (`helpers/`)**:
  - `commonActions.ts`: Centralized authentication (`loginAs(page, USER_ROLES.DEVELOPER)`) and strict endpoint verifier (`expectStrictEndpoint`).
  - `credentials.ts`: Secure role-based user credentials repository (`DEVELOPER`, `ACCOUNTS`: `invoice` / `cimcon@123`, etc.).
  - `endpoints.ts`: Centralized application route definitions.
  - `toast-messages.ts`: Single source of truth for exact system toast alert strings.
  - `logger.ts`: Centralized structured console logger.

---

## 📁 Directory Structure

```
PM-Automation/
├── Data/                             # Test Data Generators & File Assets
│   ├── Requisitions/Indents/         # Requisition dynamic data generators
│   │   └── indent-test-data.ts
│   └── Vendor/                       # Vendor registration test data & document files
│       ├── adhar-card.pdf            # Test Aadhaar document
│       ├── cancelled-cheque.jpg      # Test cancelled cheque image
│       ├── gst-certificate.pdf       # Test GST certificate document
│       ├── incoorporation.pdf        # Test Incorporation certificate
│       ├── tan.pdf                   # Test TAN letter document
│       ├── udyam.pdf                 # Test UDYAM MSME certificate
│       ├── vendor-registration.pdf   # Test Vendor Registration form
│       └── vendor-test-data.ts       # Dynamic test vendor generator & Edit test data
├── helpers/                          # Helper Utilities & Constants
│   ├── commonActions.ts              # Authentication (loginAs) & endpoint verifier
│   ├── credentials.ts                # Role credentials repository (DEVELOPER, ACCOUNTS, etc.)
│   ├── endpoints.ts                  # Application route endpoints repository
│   ├── logger.ts                     # Centralized structured visual logger
│   ├── toast-messages.ts             # Standardized toast alert strings repository
│   └── index.ts                      # Barrel export for helpers
├── pages/                            # Page Object Model (POM) Locator Classes
│   ├── Dashboard/
│   │   └── headerNavigations.locators.ts # Header menu, dropdowns & route navigation (with UI logout)
│   ├── Purchase/Databases/
│   │   └── masterDatabase.locators.ts # Purchase Master Database & PO Generation locators
│   ├── Requisition/Indents/
│   │   └── newIndent.locators.ts     # New Indent, Add Project & All Projects Modal locators
│   ├── Vendor/
│   │   ├── vendorApproval.locators.ts   # Vendor Approval queue & View Details modal
│   │   ├── vendorDatabase.locators.ts   # Master Vendor Directory & DataGrid locators
│   │   ├── vendorDatabaseFilters.locators.ts # Filter drawer locators & filter actions
│   │   ├── vendorEdit.locators.ts       # Vendor Edit page, state cards & Edit modal
│   │   └── vendorRegistration.locators.ts # Vendor Registration form & field actions
│   └── auth/
│       └── login.locators.ts            # Login page form inputs & submit button
├── fixtures/                         # Extended Test Fixtures
│   ├── requisition.fixture.ts        # Fixtures for Requisition POMs
│   └── vendor.fixture.ts             # Fixtures for Vendor POMs
├── tests/                            # End-to-End Functional Test Suites
│   ├── auth/
│   │   └── login.spec.ts                # Authentication & session verification specs
│   ├── Requisition/Indents/
│   │   ├── NewProjectCreation.spec.ts   # Project creation, incremental validation & duplicate checks
│   │   ├── ProjectVerification.spec.ts  # Project creation, reload, All Projects grid validation & selection
│   │   └── README.md                    # Requisitions Indents documentation
│   └── vendor/
│       ├── VendorAccountsApprovalFlow.spec.ts # Dedicated Accounts Team Approval spec
│       ├── VendorAccountsConditionalFlow.spec.ts # Dynamic Conditional Accounts Approval/Rejection spec
│       ├── VendorAccountsRejectionFlow.spec.ts # Dedicated Accounts Team Rejection spec
│       ├── VendorApproval.spec.ts       # Vendor approval workflow & queue count specs
│       ├── VendorDatabase.spec.ts       # Vendor Database registration & table cell verification specs
│       ├── VendorDatabaseFilters.spec.ts # Filter drawer interactions, status/docs filtering & reset
│       ├── VendorDuplicateValidation.spec.ts # Duplicate GST, PAN & Name validation & shared mobile
│       ├── VendorEdit.spec.ts           # Vendor edit, edge-case search & cancel discard specs
│       ├── VendorFullLifecycle.spec.ts  # Master End-to-End 10-phase full lifecycle suite
│       ├── VendorModalActions.spec.ts   # View Details modal approve/reject actions
│       ├── VendorPoVerification.spec.ts  # PO Generation unapproved vs approved vendor availability spec
│       ├── VendorRegistration.spec.ts   # Incremental field-by-field validation & format checks
│       ├── VendorRejection.spec.ts      # Rejection flow with mandatory reason specs
│       ├── VendorVerification.spec.ts   # Pre-filled field & 7/7 documents verification specs
│       └── README.md                    # Vendor Management documentation
├── .env                              # Environment configuration variables
├── playwright.config.ts              # Playwright global runner configuration (1600x900 viewport)
├── package.json                      # Project dependencies & npm scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## 📋 Implemented Test Case Registry

### 🔐 Authentication Suite (`tests/auth/`)
| Spec File | Test Description | Tags |
| :--- | :--- | :--- |
| `login.spec.ts` | Authenticate successfully with valid Developer credentials and validate Home endpoint | `@auth`, `@smoke` |
| `login.spec.ts` | Reject login with invalid credentials and display authentication error alert | `@auth` |

### 📋 Requisition Management Suite (`tests/Requisition/Indents/`)
| Spec File | Test Description | Tags |
| :--- | :--- | :--- |
| `NewProjectCreation.spec.ts` | **Project Creation & Validation**: Incremental field filling $\rightarrow$ Error clearing $\rightarrow$ Exact toast verification (`PROJECT_CODE_CREATED`, `PROJECT_CREATED_SUCCESS`) $\rightarrow$ Duplicate project code check $\rightarrow$ Form clear & cancel | `@requisition`, `@indents` |
| `ProjectVerification.spec.ts` | **Project Persistence & Table Verification**: Create project $\rightarrow$ Reload page $\rightarrow$ Open All Projects modal $\rightarrow$ Validate 8 column headers $\rightarrow$ Search & assert row cells $\rightarrow$ Select project | `@requisition`, `@indents`, `@verification` |

### 🏭 Vendor Management Test Suite (`tests/vendor/`)
| Spec File | Test Description | Tags |
| :--- | :--- | :--- |
| `VendorFullLifecycle.spec.ts` | **Master 10-Phase Lifecycle Workflow**: Register $\rightarrow$ Pending Tab $\rightarrow$ Approval View $\rightarrow$ Rejection $\rightarrow$ Rejected Tab $\rightarrow$ Edit & Update $\rightarrow$ Re-Approval View $\rightarrow$ Final Approval $\rightarrow$ Approved Tab | `@vendor`, `@master`, `@e2e` |
| `VendorAccountsApprovalFlow.spec.ts` | **Accounts Team Approval Flow**: Register vendor $\rightarrow$ Approve on Approval page $\rightarrow$ Login as Accounts (`invoice`) $\rightarrow$ Click Approve in Database $\rightarrow$ Confirm Modal $\rightarrow$ Verify `Approved` chip in Accounts & Developer views | `@vendor`, `@accounts`, `@e2e` |
| `VendorAccountsRejectionFlow.spec.ts` | **Accounts Team Rejection Flow**: Register vendor $\rightarrow$ Approve on Approval page $\rightarrow$ Login as Accounts (`invoice`) $\rightarrow$ Click Reject in Database $\rightarrow$ Fill Remarks $\rightarrow$ Confirm Modal $\rightarrow$ Verify `Rejected` chip in Accounts & Developer views | `@vendor`, `@accounts`, `@e2e` |
| `VendorAccountsConditionalFlow.spec.ts` | **Conditional Accounts Workflow**: Dynamic inspection of 1st DB row $\rightarrow$ If Pending, execute Approval flow $\rightarrow$ If Approved/Rejected, scan rows to locate Pending vendor & execute Rejection flow $\rightarrow$ Validate Developer view | `@vendor`, `@accounts`, `@conditional` |
| `VendorPoVerification.spec.ts` | **PO Generation Availability**: Register unapproved vendor $\rightarrow$ Verify vendor absent ("No options") in `/generate-po` dropdown $\rightarrow$ Approve vendor $\rightarrow$ Verify approved vendor IS visible & selectable | `@vendor`, `@po`, `@e2e` |
| `VendorRegistration.spec.ts` | Complete incremental field-by-field validation, missing docs checks, document format checks (PDF only, Cheque formats) & submission flow | `@vendor`, `@smoke` |
| `VendorDuplicateValidation.spec.ts` | Duplicate GST, PAN & Vendor Name validation checks $\rightarrow$ Shared/duplicate mobile number registration allowed | `@vendor`, `@duplicate` |
| `VendorDatabase.spec.ts` | Register new vendor, approve on Approval page, and strictly validate all DataGrid table cells & document links in Vendor Database | `@vendor`, `@e2e` |
| `VendorDatabaseFilters.spec.ts` | Test Filter Drawer: Category filter, Has Documents filter, Accounts Approval status lifecycle filters, drawer controls & reset | `@vendor`, `@filters` |
| `VendorApproval.spec.ts` | Navigate to Vendor Approval, search pending vendor & verify approval queue count decreases by 1 | `@vendor` |
| `VendorVerification.spec.ts` | Open View Details modal on Vendor Approval page & strictly verify all pre-filled fields and 7/7 documents match registration data | `@vendor` |
| `VendorModalActions.spec.ts` | Approve/Reject vendor directly from inside View Details modal and verify queue count decreases by 1 | `@vendor` |
| `VendorRejection.spec.ts` | Perform vendor rejection flow with mandatory rejection reason modal input & queue count validation | `@vendor` |
| `VendorEdit.spec.ts` | End-to-end Vendor Information Edit & strict cross-page verification $\rightarrow$ Search edge-cases $\rightarrow$ Cancel/discard unsaved modifications | `@vendor`, `@e2e` |

---

## 🖥️ Console Execution Log Format

All test suites use the centralized logger from [`helpers/logger.ts`](file:///d:/Purchase%20Module/PM-Automation/helpers/logger.ts):

```text
================================================================================
📌 PHASE 2: PROJECT CREATION & SUBMISSION
================================================================================
   ├─ 🔹 Opening Add Project modal from Header button...
   ├─ 🔹 Verifying "Submitted By" auto-filled from login...
   ├─ 🔹 Populating project details into form fields:
   │    • Project Code            : "PROJECT1483AUTO"
   │    • Client / Project Name   : "Test Requisition Project 1788256672381"
   │    • Requested By            : "Auto Tester 1483"
   │    • Submitted By            : "Dwip Pandya"
   │    • Bill To Address         : "Cimcon Software India Pvt Ltd, 123 Tech Park, SG Highway..."
   │    • Ship To Address         : "Cimcon Central Warehouse, Unit 4, GIDC Industrial Zone..."
   ├─ 🔹 Clicking "Create Project" button...
   ├─ 🔹 Verifying Project Code creation toast: "Project code created successfully" (exact match)...
   └── ✅ Verified exact toast: "Project code created successfully"
   ├─ 🔹 Verifying Project created toast: "Project created successfully!" (exact match)...
   └── ✅ Verified exact toast: "Project created successfully!"
   └── ✅ Project "PROJECT1483AUTO" successfully created and saved in backend database.

================================================================================
🏆 PROJECT VERIFICATION SUITE COMPLETED SUCCESSFULLY
================================================================================
```

---

## 🚀 Execution & Command Reference

### Run Complete Test Suite
```bash
npx playwright test --project=chromium
```

### Run Requisition Indents Tests
```bash
# Run Project Verification Test (Create -> Reload -> All Projects Grid -> Select)
npx playwright test tests/Requisition/Indents/ProjectVerification.spec.ts --project=chromium

# Run New Project Creation Suite
npx playwright test tests/Requisition/Indents/NewProjectCreation.spec.ts --project=chromium
```

### Run Vendor Management Tests
```bash
# Run Master Full Lifecycle Suite
npx playwright test tests/vendor/VendorFullLifecycle.spec.ts --project=chromium

# Run Vendor Database Filters Suite
npx playwright test tests/vendor/VendorDatabaseFilters.spec.ts --project=chromium

# Run Entire Vendor Directory
npx playwright test tests/vendor/ --project=chromium
```

### View HTML Execution Report
```bash
npx playwright show-report
```

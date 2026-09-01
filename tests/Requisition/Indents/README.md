<div align="center">

# 📋 Requisitions — Indents Automation

**End-to-End Automated Test Suites for Indents & Project Management**

![Module](https://img.shields.io/badge/module-Requisition%20Indents-blue?style=flat-square)
![Framework](https://img.shields.io/badge/framework-Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Coverage](https://img.shields.io/badge/coverage-Project%20Creation%20%26%20Grid%20Selection-blueviolet?style=flat-square)
![Validation](https://img.shields.io/badge/verification-Strict%20Exact%20Matching-success?style=flat-square)

Incremental validation, dynamic project creation, grid persistence, and project selection for material requisitions.

</div>

---

## 📂 Directory Structure

```
d:/Purchase Module/PM-Automation/
├── pages/Requisition/Indents/
│   └── newIndent.locators.ts                   # Page Object Model for New Indent & Add Project / All Projects modal
├── Data/Requisitions/Indents/
│   └── indent-test-data.ts                     # Dynamic test data generators for Project Creation
├── fixtures/
│   └── requisition.fixture.ts                  # Injected test fixture with pre-initialized POMs
└── tests/Requisition/Indents/
    ├── README.md                               # This documentation file
    ├── NewProjectCreation.spec.ts              # Project creation, incremental validation & duplicate checks
    └── ProjectVerification.spec.ts             # Project creation, reload, All Projects grid validation & selection
```

---

## 🧪 Test Suites

### 1. `NewProjectCreation.spec.ts`
- **Phase 1: Authentication & Navigation**: Developer login (`dwip`) $\rightarrow$ Navigate to `/requisition-form`.
- **Phase 2: Page Elements Verification**: Header & main CTA controls.
- **Phase 3: Pre-fill Validation**: Auto-filled `"Dwip Pandya"` in `Submitted By`.
- **Phase 4: Empty Form Validation**: Required field error messages on all 5 inputs.
- **Phase 5: Incremental Field Filling**: Field-by-field filling loop.
- **Phase 6: Project Creation Toasts**: Validates `"Project code created successfully"` & `"Project created successfully!"`.
- **Phase 7: Duplicate Project Code**: Asserts `"Project code {code} already exists."`.
- **Phase 8: Modal Clear Form & Cancel**: Reset and dismiss behaviors.

### 2. `ProjectVerification.spec.ts`
- **Phase 1: Developer Login & Navigation**: Clean authentication and navigation to `/requisition-form`.
- **Phase 2: Project Creation**: Creates a project with dynamic data and validates exact toasts.
- **Phase 3: Page Reload**: Reloads page and confirms persistent session on `/requisition-form`.
- **Phase 4: All Projects Modal**: Opens modal and verifies all 8 column headers (`Project Code`, `Client Project Name`, `Bill To`, `Ship To`, `Requested By`, `Prepared By`, `Approved By`, `Action`).
- **Phase 5: Search & Data Verification**: Searches created project code in modal, targets row, and asserts field equality (`Project Code`, `Client Name`, `Requested By`).
- **Phase 6: Select Project**: Clicks row **Select** button and verifies modal closes with project loaded into form.

---

## 🎯 Toast Alerts Dictionary (`TOAST_MESSAGES.REQUISITION`)

- `FORM_CLEARED`: `"Form has been cleared"`
- `PROJECT_CODE_CREATED`: `"Project code created successfully"`
- `PROJECT_CREATED_SUCCESS`: `"Project created successfully!"`
- `PLEASE_FILL_REQUIRED_FIELDS`: `"Please fill out all required fields."`
- `DUPLICATE_PROJECT_CODE`: `(code) => "Project code " + code + " already exists."`
- `ERRORS.PROJECT_CODE_REQUIRED`: `"Project Code is required"`
- `ERRORS.CLIENT_PROJECT_NAME_REQUIRED`: `"Client/Project Name is required"`
- `ERRORS.REQUESTED_BY_REQUIRED`: `"Requested By is required"`
- `ERRORS.BILL_TO_REQUIRED`: `"Bill To Address is required"`
- `ERRORS.SHIP_TO_REQUIRED`: `"Ship To Address is required"`

---

## 🚀 Execution Commands

```powershell
# Run Project Creation & Incremental Validation Suite
npx playwright test tests/Requisition/Indents/NewProjectCreation.spec.ts --headed --project=chromium

# Run Project Creation, Reload & All Projects Grid Selection Suite
npx playwright test tests/Requisition/Indents/ProjectVerification.spec.ts --headed --project=chromium

# Run Entire Requisition Indents Suite
npx playwright test tests/Requisition/Indents/ --project=chromium
```

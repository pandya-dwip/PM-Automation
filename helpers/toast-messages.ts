/**
 * Centralized repository for application toast alert messages.
 */
export const TOAST_MESSAGES = {
  VENDOR: {
    // ── Lifecycle & Action Success ──────────────────────────────────────────
    REGISTERED_SUCCESS: 'Vendor registered successfully!',
    REJECTED_SUCCESS: 'Vendor rejected successfully',
    APPROVED_SUCCESS: 'Vendor approved successfully',
    EDITED_SUCCESS: 'Vendor information updated and submitted for approval!',
    EXPORT_SUCCESS: 'Export completed successfully',

    // ── Document Downloads ──────────────────────────────────────────────────
    DOWNLOAD_PAN_CARD: 'PAN Card downloaded successfully',
    DOWNLOAD_GST_CERTIFICATE: 'GST Certificate downloaded successfully',
    DOWNLOAD_INCORPORATION: 'Incorporation Certificate downloaded successfully',
    DOWNLOAD_CANCELLED_CHEQUE: 'Cancelled Cheque downloaded successfully',
    DOWNLOAD_TAN_LETTER: 'TAN Allotment Letter downloaded successfully',
    DOWNLOAD_MSME_CERTIFICATE: 'MSME Certificate downloaded successfully',
    DOWNLOAD_REG_FORM: 'Vendor Registration Form downloaded successfully',

    // ── Duplicate Validation ────────────────────────────────────────────────
    DUPLICATE_GST: 'A vendor with this GST number already exists.',
    DUPLICATE_PAN: 'A vendor with this PAN number already exists.',
    DUPLICATE_VENDOR_NAME: 'A vendor with this name already exists.',

    // ── Missing Fields & Format Validation ──────────────────────────────────
    MISSING_FIELDS_AND_DOCUMENTS:
      'Missing fields: Product Category, Vendor Name, Contact Person, Mobile Number 1, Email 1, Address, GST Number, PAN Number, State, State Code, MSME. Missing documents: PAN Card, GST Certificate, Cancelled Cheque, Vendor Registration Form',
    INVALID_FORMAT_PDF_ONLY: 'Only PDF format is allowed for document uploads.',
    INVALID_FORMAT_CHEQUE: 'Only PDF, JPG, JPEG, or PNG format is allowed for Cancelled Cheque.',
  },

  REQUISITION: {
    FORM_CLEARED: 'Form has been cleared',
    PROJECT_CODE_CREATED: 'Project code created successfully',
    PROJECT_CREATED_SUCCESS: 'Project created successfully!',
    PLEASE_FILL_REQUIRED_FIELDS: 'Please fill out all required fields.',
    DUPLICATE_PROJECT_CODE: (code: string) => `Project code ${code} already exists.`,
    ERRORS: {
      PROJECT_CODE_REQUIRED: 'Project Code is required',
      CLIENT_PROJECT_NAME_REQUIRED: 'Client/Project Name is required',
      REQUESTED_BY_REQUIRED: 'Requested By is required',
      BILL_TO_REQUIRED: 'Bill To Address is required',
      SHIP_TO_REQUIRED: 'Ship To Address is required',
    },
  },
} as const;

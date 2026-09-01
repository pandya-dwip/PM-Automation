import path from 'path';
import { VendorFormData } from '../../pages/Vendor/vendorRegistration.locators';

/**
 * File assets for document upload validation testing.
 */
export const VENDOR_FILE_ASSETS = {
  imageJpg: path.resolve(__dirname, 'image.jpg'),
  excelXlsx: path.resolve(__dirname, 'excel.xlsx'),
};

export interface RandomizedVendorOptions {
  isMsme?: boolean;
  uploadIncorporation?: boolean;
  uploadTan?: boolean;
}

/**
 * Generates dynamic vendor test data with randomized optional documents (Incorporation, TAN)
 * and randomized MSME selection (Yes/No + UDYAM Certificate).
 */
export function getRandomizedVendorData(options: RandomizedVendorOptions = {}): {
  data: VendorFormData;
  stats: {
    isMsme: boolean;
    hasPan: boolean;
    hasGst: boolean;
    hasCheque: boolean;
    hasRegForm: boolean;
    hasIncorporation: boolean;
    hasTan: boolean;
    hasMsmeCert: boolean;
    uploadedCount: number;
    totalDocs: number;
    ratioText: string;
    docsText: string;
    headerText: string;
  };
} {
  const timestamp = Date.now();
  const random4Digit = Math.floor(1000 + Math.random() * 9000);

  // Randomize MSME if not explicitly provided
  const isMsme = options.isMsme !== undefined ? options.isMsme : Math.random() < 0.5;

  // Randomize optional documents (both, only 1, or none)
  let uploadIncorporation: boolean;
  let uploadTan: boolean;

  if (options.uploadIncorporation !== undefined && options.uploadTan !== undefined) {
    uploadIncorporation = options.uploadIncorporation;
    uploadTan = options.uploadTan;
  } else {
    // 3 possibilities: 0 = both, 1 = only incorporation, 2 = only TAN, 3 = none
    const randChoice = Math.floor(Math.random() * 4);
    uploadIncorporation = randChoice === 0 || randChoice === 1;
    uploadTan = randChoice === 0 || randChoice === 2;
  }

  // If MSME is yes, upload MSME certificate; if no, do not upload
  const uploadMsmeCert = isMsme;

  const data: VendorFormData = {
    productCategory: 'Test Electronics Category',
    vendorName: `Test Vendor ${timestamp}`,
    contactPerson: `Test User ${random4Digit}`,
    mobile1: `9820${random4Digit}56`,
    mobile2: `9820${random4Digit}57`,
    primaryEmail: `test.vendor.${timestamp}@example.com`,
    secondaryEmail: `test.orders.${timestamp}@example.com`,
    website: 'https://www.test-vendor-example.com',
    isMsme,
    gstNumber: `27AACCA${random4Digit}F1Z9`,
    panNumber: `AACCA${random4Digit}F`,
    address: '123 Test Street, Test Industrial Zone',
    state: 'Maharashtra',
    stateCode: '27',

    // Mandatory documents (always uploaded)
    panCardFilePath: path.resolve(__dirname, 'adhar-card.pdf'),
    gstCertificateFilePath: path.resolve(__dirname, 'gst-certificate.pdf'),
    cancelledChequeFilePath: path.resolve(__dirname, 'cancelled-cheque.jpg'),
    vendorRegFormFilePath: path.resolve(__dirname, 'vendor-registration.pdf'),

    // Optional documents (randomized: both, 1, or none)
    incorporationFilePath: uploadIncorporation ? path.resolve(__dirname, 'incoorporation.pdf') : undefined,
    tanLetterFilePath: uploadTan ? path.resolve(__dirname, 'tan.pdf') : undefined,
    udyamCertificateFilePath: uploadMsmeCert ? path.resolve(__dirname, 'udyam.pdf') : undefined,
  };

  // Denominator: 7 if MSME is Yes, 6 (or 4 if no optional attached) if MSME is No
  let totalDocs: number;
  if (isMsme) {
    totalDocs = 7;
  } else {
    totalDocs = uploadIncorporation || uploadTan ? 6 : 4;
  }

  // Numerator: count of attached documents
  let uploadedCount = 4; // PAN, GST, Cancelled Cheque, Reg Form
  if (uploadIncorporation) uploadedCount++;
  if (uploadTan) uploadedCount++;
  if (uploadMsmeCert) uploadedCount++;

  const ratioText = `${uploadedCount}/${totalDocs}`;
  const docsText = `${ratioText} docs`;
  const headerText = `Documents (${ratioText})`;

  return {
    data,
    stats: {
      isMsme,
      hasPan: true,
      hasGst: true,
      hasCheque: true,
      hasRegForm: true,
      hasIncorporation: uploadIncorporation,
      hasTan: uploadTan,
      hasMsmeCert: uploadMsmeCert,
      uploadedCount,
      totalDocs,
      ratioText,
      docsText,
      headerText,
    },
  };
}

/**
 * Generates dynamic, unique vendor test data on every execution for Registration.
 * Uses generic test values to avoid using real company/person names.
 *
 * @param overrides Optional field overrides for specific test scenarios
 */
export function getDynamicVendorData(overrides: Partial<VendorFormData> = {}): VendorFormData {
  const timestamp = Date.now();
  const random4Digit = Math.floor(1000 + Math.random() * 9000);

  return {
    productCategory: 'Test Electronics Category',
    vendorName: `Test Vendor ${timestamp}`,
    contactPerson: `Test User ${random4Digit}`,
    mobile1: `9820${random4Digit}56`,
    mobile2: `9820${random4Digit}57`,
    primaryEmail: `test.vendor.${timestamp}@example.com`,
    secondaryEmail: `test.orders.${timestamp}@example.com`,
    website: 'https://www.test-vendor-example.com',
    isMsme: true,
    gstNumber: `27AACCA${random4Digit}F1Z9`,
    panNumber: `AACCA${random4Digit}F`,
    address: '123 Test Street, Test Industrial Zone',
    state: 'Maharashtra',
    stateCode: '27',

    // Document File Upload Paths
    panCardFilePath: path.resolve(__dirname, 'adhar-card.pdf'),
    gstCertificateFilePath: path.resolve(__dirname, 'gst-certificate.pdf'),
    incorporationFilePath: path.resolve(__dirname, 'incoorporation.pdf'),
    cancelledChequeFilePath: path.resolve(__dirname, 'cancelled-cheque.jpg'),
    tanLetterFilePath: path.resolve(__dirname, 'tan.pdf'),
    udyamCertificateFilePath: path.resolve(__dirname, 'udyam.pdf'),
    vendorRegFormFilePath: path.resolve(__dirname, 'vendor-registration.pdf'),
    ...overrides,
  };
}

/**
 * Generates dynamic, unique vendor test data on every execution for Edit updates.
 *
 * @param overrides Optional field overrides for specific test scenarios
 */
export function getDynamicEditVendorData(overrides: Partial<VendorFormData> = {}): VendorFormData {
  const timestamp = Date.now();
  const random4Digit = Math.floor(1000 + Math.random() * 9000);

  return {
    productCategory: 'Updated Industrial Category',
    vendorName: `Updated Vendor ${timestamp}`,
    contactPerson: `Updated Manager ${random4Digit}`,
    mobile1: `9821${random4Digit}88`,
    mobile2: `9821${random4Digit}89`,
    primaryEmail: `updated.vendor.${timestamp}@example.com`,
    secondaryEmail: `updated.orders.${timestamp}@example.com`,
    website: 'https://www.updated-vendor-example.com',
    isMsme: false,
    gstNumber: `27BBCCB${random4Digit}F1Z8`,
    panNumber: `BBCCB${random4Digit}F`,
    address: '456 Updated Industrial Highway, Zone 2',
    state: 'Gujarat',
    stateCode: '24',

    // Document File Upload Paths
    panCardFilePath: path.resolve(__dirname, 'adhar-card.pdf'),
    gstCertificateFilePath: path.resolve(__dirname, 'gst-certificate.pdf'),
    incorporationFilePath: path.resolve(__dirname, 'incoorporation.pdf'),
    cancelledChequeFilePath: path.resolve(__dirname, 'cancelled-cheque.jpg'),
    tanLetterFilePath: path.resolve(__dirname, 'tan.pdf'),
    udyamCertificateFilePath: path.resolve(__dirname, 'udyam.pdf'),
    vendorRegFormFilePath: path.resolve(__dirname, 'vendor-registration.pdf'),
    ...overrides,
  };
}

export const VENDOR_TEST_DATA = {
  get validVendor() {
    return getDynamicVendorData();
  },
  get editVendor() {
    return getDynamicEditVendorData();
  },
};

/**
 * Dummy rejection remarks for Vendor Approval testing.
 */
export const VENDOR_REJECTION_REASONS = {
  DOCUMENTS_INVALID: 'Uploaded documents are invalid or incomplete. Please resubmit valid PDF documents.',
  GENERIC_REJECT: 'Test Rejection: Documentation validation failed during QA verification process.',
} as const;

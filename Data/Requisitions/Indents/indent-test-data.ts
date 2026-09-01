import { ProjectFormData } from '../../../pages/Requisition/Indents/newIndent.locators';

/**
 * Generates dynamic, unique test data for Requisition Project creation.
 *
 * @param overrides Optional field overrides
 */
export function getDynamicProjectData(overrides: Partial<ProjectFormData> = {}): ProjectFormData {
  const timestamp = Date.now();
  const random4Digit = Math.floor(1000 + Math.random() * 9000);

  return {
    projectCode: `PROJECT${random4Digit}AUTO`,
    clientProjectName: `Test Requisition Project ${timestamp}`,
    requestedBy: `Auto Tester ${random4Digit}`,
    billTo: 'Cimcon Software India Pvt Ltd, 123 Tech Park, SG Highway, Ahmedabad, Gujarat 380054',
    shipTo: 'Cimcon Central Warehouse, Unit 4, GIDC Industrial Zone, Changodar, Gujarat 382213',
    ...overrides,
  };
}

export const INDENT_TEST_DATA = {
  get validProject() {
    return getDynamicProjectData();
  },
};

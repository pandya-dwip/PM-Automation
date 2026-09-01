/**
 * User roles defined in the Purchase Module system.
 */
export const USER_ROLES = {
  ACCOUNTS: 'Accounts',
  ADMIN: 'Admin',
  AMBER: 'Amber',
  APPROVER: 'Approver',
  DEVELOPER: 'Developer',
  PURCHASER: 'Purchaser',
  REQUISITOR: 'Requisitor',
  REQUISITOR_STORE: 'Requisitor/Store',
  STORE: 'Store',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Interface representing user credentials.
 */
export interface UserCredential {
  username: string;
  password: string;
  role: UserRole;
}

/**
 * Global user credentials repository mapped by role.
 * Username and password are loaded dynamically from environment variables (.env) with default fallbacks.
 */
export const USER_CREDENTIALS: Record<UserRole, UserCredential> = {
  [USER_ROLES.ACCOUNTS]: {
    username: process.env.ACCOUNTS_USERNAME || 'invoice',
    password: process.env.ACCOUNTS_PASSWORD || 'cimcon@123',
    role: USER_ROLES.ACCOUNTS,
  },
  [USER_ROLES.ADMIN]: {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
    role: USER_ROLES.ADMIN,
  },
  [USER_ROLES.AMBER]: {
    username: process.env.AMBER_USERNAME || '',
    password: process.env.AMBER_PASSWORD || '',
    role: USER_ROLES.AMBER,
  },
  [USER_ROLES.APPROVER]: {
    username: process.env.APPROVER_USERNAME || '',
    password: process.env.APPROVER_PASSWORD || '',
    role: USER_ROLES.APPROVER,
  },
  [USER_ROLES.DEVELOPER]: {
    username: process.env.DEVELOPER_USERNAME || 'dwip',
    password: process.env.DEVELOPER_PASSWORD || 'Dwip@123',
    role: USER_ROLES.DEVELOPER,
  },
  [USER_ROLES.PURCHASER]: {
    username: process.env.PURCHASER_USERNAME || '',
    password: process.env.PURCHASER_PASSWORD || '',
    role: USER_ROLES.PURCHASER,
  },
  [USER_ROLES.REQUISITOR]: {
    username: process.env.REQUISITOR_USERNAME || '',
    password: process.env.REQUISITOR_PASSWORD || '',
    role: USER_ROLES.REQUISITOR,
  },
  [USER_ROLES.REQUISITOR_STORE]: {
    username: process.env.REQUISITOR_STORE_USERNAME || '',
    password: process.env.REQUISITOR_STORE_PASSWORD || '',
    role: USER_ROLES.REQUISITOR_STORE,
  },
  [USER_ROLES.STORE]: {
    username: process.env.STORE_USERNAME || '',
    password: process.env.STORE_PASSWORD || '',
    role: USER_ROLES.STORE,
  },
};

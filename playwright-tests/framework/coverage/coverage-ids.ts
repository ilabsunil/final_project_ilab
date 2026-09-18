// Friendly constants for the CoverageEngine inventory IDs, so specs read
// `coverage.functionality(M.LOANS, S.LOAN_APPLICATIONS, F.LOAN_OPEN, ...)` instead of raw
// strings. Keep in sync with CoverageEngine/01-module-inventory/module_inventory.json.

// Modules (routes)
export const M = {
  AUTH: 'route-auth',
  DASHBOARD: 'route-dashboard',
  USERS: 'route-users',
  LOANS: 'route-loans',
  CARDS: 'route-cards',
  STATEMENTS: 'route-statements',
  ACTIVITY: 'route-activity',
  PREFERENCES: 'route-preferences',
} as const;

// Sub-modules (components) — every sub-module in the app, per module.
export const S = {
  // Authentication
  LOGIN_FORM: 'component-login-form',
  SESSION: 'component-session',
  // Dashboard
  DASH_GREETING: 'component-dash-greeting',
  DASH_LOANS_CARD: 'component-dash-loans-card',
  DASH_STATEMENTS_CARD: 'component-dash-statements-card',
  DASH_CARDS_CARD: 'component-dash-cards-card',
  DASH_CUSTOMERS_CARD: 'component-dash-customers-card',
  DASH_QUICK_LINKS: 'component-dash-quick-links',
  // User Details
  USER_PROFILE_HEADER: 'component-user-profile-header',
  USER_ACCOUNT_DETAILS: 'component-user-account-details',
  // Loans
  LOAN_LIST: 'component-loan-list',
  LOAN_APPLY: 'component-loan-apply',
  // Credit Cards
  CARD_LIST: 'component-card-list',
  CARD_MANAGE: 'component-card-manage',
  // Statements
  STATEMENT_LIST: 'component-statement-list',
  STATEMENT_DOWNLOAD: 'component-statement-download',
  // Activity History
  ACTIVITY_LIST: 'component-activity-list',
  ACTIVITY_DOWNLOAD: 'component-activity-download',
  // Preferences
  PREFERENCES_LIST: 'component-preferences-list',
  PREFERENCES_EDIT: 'component-preferences-edit',
} as const;

// Functionality (actions) — every action / validation the app exposes.
export const F = {
  // Authentication
  AUTH_ENTER_EMAIL: 'action-auth-enter-email',
  AUTH_ENTER_PASSWORD: 'action-auth-enter-password',
  AUTH_SIGNIN: 'action-auth-signin',
  AUTH_INVALID_LOGIN: 'action-auth-invalid-login',
  AUTH_SIGNOUT: 'action-auth-signout',
  // Dashboard
  DASH_VIEW_GREETING: 'action-dash-view-greeting',
  DASH_OPEN_LOANS: 'action-dash-open-loans',
  DASH_OPEN_STATEMENTS: 'action-dash-open-statements',
  DASH_OPEN_CARDS: 'action-dash-open-cards',
  DASH_OPEN_CUSTOMERS: 'action-dash-open-customers',
  DASH_VIEW_ACTIVITY: 'action-dash-view-activity',
  // User Details
  USER_OPEN: 'action-user-open',
  USER_VIEW_NAME: 'action-user-view-name',
  USER_VIEW_STATUS: 'action-user-view-status',
  USER_VIEW_FULL_NAME: 'action-user-view-full-name',
  USER_VIEW_ACCOUNT_NUMBER: 'action-user-view-account-number',
  USER_VIEW_EMAIL: 'action-user-view-email',
  USER_VIEW_PHONE: 'action-user-view-phone',
  USER_VIEW_ADDRESS: 'action-user-view-address',
  USER_VIEW_ACCOUNT_TYPE: 'action-user-view-account-type',
  // Loans
  LOAN_OPEN: 'action-loan-open',
  LOAN_VIEW_HOME_EQUITY: 'action-loan-view-home-equity',
  LOAN_VIEW_AUTO: 'action-loan-view-auto',
  LOAN_OPEN_DETAIL: 'action-loan-open-detail',
  LOAN_APPLY: 'action-loan-apply',
  // Credit Cards
  CARD_OPEN: 'action-card-open',
  CARD_VIEW_CASH_REWARDS: 'action-card-view-cash-rewards',
  CARD_VIEW_POINTS: 'action-card-view-points',
  CARD_OPEN_DETAIL: 'action-card-open-detail',
  CARD_MANAGE: 'action-card-manage',
  // Statements
  STATEMENT_OPEN: 'action-statement-open',
  STATEMENT_VIEW_SEPTEMBER: 'action-statement-view-september',
  STATEMENT_VIEW_AUGUST: 'action-statement-view-august',
  STATEMENT_VIEW_JULY: 'action-statement-view-july',
  STATEMENT_OPEN_DETAIL: 'action-statement-open-detail',
  STATEMENT_DOWNLOAD: 'action-statement-download',
  // Activity History
  ACTIVITY_OPEN: 'action-activity-open',
  ACTIVITY_VIEW_DEPOSIT: 'action-activity-view-deposit',
  ACTIVITY_VIEW_PAYMENT: 'action-activity-view-payment',
  ACTIVITY_VIEW_WITHDRAWAL: 'action-activity-view-withdrawal',
  ACTIVITY_VIEW_STATUS: 'action-activity-view-status',
  ACTIVITY_DOWNLOAD: 'action-activity-download',
  // Preferences
  PREFERENCES_OPEN: 'action-preferences-open',
  PREFERENCES_VIEW_EMAIL: 'action-preferences-view-email',
  PREFERENCES_VIEW_PAPERLESS: 'action-preferences-view-paperless',
  PREFERENCES_VIEW_2FA: 'action-preferences-view-2fa',
  PREFERENCES_EDIT: 'action-preferences-edit',
} as const;

// Workflows
export const W = {
  AUTH: 'workflow-authentication',
  BANKING_OVERVIEW: 'workflow-banking-overview',
  USER_PROFILE: 'workflow-user-profile',
  LOAN_APPLICATION: 'workflow-loan-application',
  CARD_MANAGEMENT: 'workflow-card-management',
  STATEMENT_REVIEW: 'workflow-statement-review',
  ACTIVITY_REVIEW: 'workflow-activity-review',
  PREFERENCES: 'workflow-preferences',
} as const;

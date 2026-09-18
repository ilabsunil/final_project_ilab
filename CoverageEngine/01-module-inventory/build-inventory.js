// Builds module_inventory.json for the PNC Bank app with EVERY sub-module and its
// functionality modelled explicitly (route → component → action), so the test-gap
// report can list each untouched sub-module / functionality individually.
// Run: node build-inventory.js
const fs = require('node:fs');
const path = require('node:path');

const comp = (id, name, selector, actions, workflows = []) => ({ id, name, selector, actions, workflows });
const act = (id, name, event = 'click') => ({ id, name, event });

const routes = [
  // ---------------- AUTHENTICATION ----------------
  {
    id: 'route-auth', path: '/', name: 'Authentication', risk: 'high',
    components: [
      comp('component-login-form', 'Login form', '.login-card', [
        act('action-auth-enter-email', 'Enter work email', 'input'),
        act('action-auth-enter-password', 'Enter password', 'input'),
        act('action-auth-signin', 'Sign in', 'submit'),
        act('action-auth-invalid-login', 'Reject invalid credentials', 'submit'),
      ], ['workflow-authentication']),
      comp('component-session', 'Session controls', '.logout', [
        act('action-auth-signout', 'Sign out'),
      ], ['workflow-authentication']),
    ],
  },
  // ---------------- DASHBOARD ----------------
  {
    id: 'route-dashboard', path: '/dashboard', name: 'Dashboard', risk: 'medium',
    components: [
      comp('component-dash-greeting', 'Welcome greeting', '.banking-hero h1', [
        act('action-dash-view-greeting', 'View personalised greeting', 'view'),
      ], ['workflow-banking-overview']),
      comp('component-dash-loans-card', 'Loans service card', ".service-card:has-text('Loans')", [
        act('action-dash-open-loans', 'Open Loans from dashboard'),
      ], ['workflow-banking-overview']),
      comp('component-dash-statements-card', 'Statements service card', ".service-card:has-text('Statements')", [
        act('action-dash-open-statements', 'Open Statements from dashboard'),
      ], ['workflow-banking-overview']),
      comp('component-dash-cards-card', 'Cards service card', ".service-card:has-text('Cards')", [
        act('action-dash-open-cards', 'Open Cards from dashboard'),
      ], ['workflow-banking-overview']),
      comp('component-dash-customers-card', 'Customers service card', ".service-card:has-text('Customers')", [
        act('action-dash-open-customers', 'Open Customers from dashboard'),
      ], ['workflow-banking-overview']),
      comp('component-dash-quick-links', 'Quick links', '.banking-quick-links', [
        act('action-dash-view-activity', 'View activity history link'),
      ], ['workflow-banking-overview']),
    ],
  },
  // ---------------- USER DETAILS ----------------
  {
    id: 'route-users', path: '/users', name: 'User Details', risk: 'high',
    components: [
      comp('component-user-profile-header', 'Profile header', '.profile-header', [
        act('action-user-open', 'Open user details'),
        act('action-user-view-name', 'View account holder name', 'view'),
        act('action-user-view-status', 'View account status', 'view'),
      ], ['workflow-user-profile']),
      comp('component-user-account-details', 'Account details', '.detail-grid', [
        act('action-user-view-full-name', 'View full name', 'view'),
        act('action-user-view-account-number', 'View account number', 'view'),
        act('action-user-view-email', 'View email address', 'view'),
        act('action-user-view-phone', 'View phone number', 'view'),
        act('action-user-view-address', 'View home address', 'view'),
        act('action-user-view-account-type', 'View account type', 'view'),
      ], ['workflow-user-profile']),
    ],
  },
  // ---------------- LOANS ----------------
  {
    id: 'route-loans', path: '/loans', name: 'Loans', risk: 'high',
    components: [
      comp('component-loan-list', 'Loan list', '.banking-list', [
        act('action-loan-open', 'Open loans list'),
        act('action-loan-view-home-equity', 'View Home Equity Loan', 'view'),
        act('action-loan-view-auto', 'View Auto Loan', 'view'),
        act('action-loan-open-detail', 'Open a loan detail row'),
      ], ['workflow-loan-application']),
      comp('component-loan-apply', 'Apply for a loan', "button:has-text('Apply for a loan')", [
        act('action-loan-apply', 'Apply for a loan'),
      ], ['workflow-loan-application']),
    ],
  },
  // ---------------- CREDIT CARDS ----------------
  {
    id: 'route-cards', path: '/creditcards', name: 'Credit Cards', risk: 'high',
    components: [
      comp('component-card-list', 'Credit card list', '.banking-list', [
        act('action-card-open', 'Open credit cards list'),
        act('action-card-view-cash-rewards', 'View PNC Cash Rewards Visa', 'view'),
        act('action-card-view-points', 'View PNC Points Visa', 'view'),
        act('action-card-open-detail', 'Open a card detail row'),
      ], ['workflow-card-management']),
      comp('component-card-manage', 'Manage cards', "button:has-text('Manage cards')", [
        act('action-card-manage', 'Manage cards'),
      ], ['workflow-card-management']),
    ],
  },
  // ---------------- STATEMENTS ----------------
  {
    id: 'route-statements', path: '/statements', name: 'Statements', risk: 'medium',
    components: [
      comp('component-statement-list', 'Monthly statement list', '.banking-list', [
        act('action-statement-open', 'Open statements list'),
        act('action-statement-view-september', 'View September 2026 statement', 'view'),
        act('action-statement-view-august', 'View August 2026 statement', 'view'),
        act('action-statement-view-july', 'View July 2026 statement', 'view'),
        act('action-statement-open-detail', 'Open a statement detail row'),
      ], ['workflow-statement-review']),
      comp('component-statement-download', 'Download statements', "button:has-text('Download statements')", [
        act('action-statement-download', 'Download statements'),
      ], ['workflow-statement-review']),
    ],
  },
  // ---------------- ACTIVITY HISTORY ----------------
  {
    id: 'route-activity', path: '/activity', name: 'Activity History', risk: 'low',
    components: [
      comp('component-activity-list', 'Transaction list', '.banking-list', [
        act('action-activity-open', 'Open activity history'),
        act('action-activity-view-deposit', 'View direct deposit', 'view'),
        act('action-activity-view-payment', 'View online payment', 'view'),
        act('action-activity-view-withdrawal', 'View ATM withdrawal', 'view'),
        act('action-activity-view-status', 'View transaction status badges', 'view'),
      ], ['workflow-activity-review']),
      comp('component-activity-download', 'Download activity', "button:has-text('Download activity')", [
        act('action-activity-download', 'Download activity'),
      ], ['workflow-activity-review']),
    ],
  },
  // ---------------- PREFERENCES ----------------
  {
    id: 'route-preferences', path: '/preferences', name: 'Preferences', risk: 'low',
    components: [
      comp('component-preferences-list', 'Preferences list', '.banking-list', [
        act('action-preferences-open', 'Open preferences'),
        act('action-preferences-view-email', 'View email notifications setting', 'view'),
        act('action-preferences-view-paperless', 'View paperless statements setting', 'view'),
        act('action-preferences-view-2fa', 'View two-step verification setting', 'view'),
      ], ['workflow-preferences']),
      comp('component-preferences-edit', 'Edit preferences', "button:has-text('Edit preferences')", [
        act('action-preferences-edit', 'Edit preferences'),
      ], ['workflow-preferences']),
    ],
  },
];

const workflows = [
  { id: 'workflow-authentication', name: 'Authenticate', requiredActions: ['action-auth-signin'] },
  { id: 'workflow-banking-overview', name: 'Review banking services', requiredActions: ['action-dash-view-greeting'] },
  { id: 'workflow-user-profile', name: 'Review customer profile', requiredActions: ['action-user-open', 'action-user-view-email'] },
  { id: 'workflow-loan-application', name: 'Manage loans', requiredActions: ['action-loan-open', 'action-loan-apply'] },
  { id: 'workflow-card-management', name: 'Manage credit cards', requiredActions: ['action-card-open', 'action-card-manage'] },
  { id: 'workflow-statement-review', name: 'Review statements', requiredActions: ['action-statement-open', 'action-statement-download'] },
  { id: 'workflow-activity-review', name: 'Review activity history', requiredActions: ['action-activity-open'] },
  { id: 'workflow-preferences', name: 'Manage preferences', requiredActions: ['action-preferences-open'] },
];

const inventory = {
  application: {
    id: 'pnc-banking',
    name: 'PNC Bank Digital Banking Application',
    baseUrl: 'http://localhost:5173',
    routes,
    workflows,
  },
};

const out = path.join(__dirname, 'module_inventory.json');
fs.writeFileSync(out, JSON.stringify(inventory, null, 2) + '\n');
const subs = routes.reduce((n, r) => n + r.components.length, 0);
const fns = routes.reduce((n, r) => n + r.components.reduce((k, c) => k + c.actions.length, 0), 0);
console.log(`Wrote ${out}\nModules: ${routes.length}  Sub-modules: ${subs}  Functionality: ${fns}  Total nodes: ${routes.length + subs + fns}`);

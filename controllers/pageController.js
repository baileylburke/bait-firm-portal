// Load content for the public pages

// Sample return for the Home page illustration
const SAMPLE_RETURN = {
  client: 'Hartley, James & Maria',
  form: 'Form 1040',
  title: 'U.S. Individual Income Tax Return',
  year: 2025,
  lines: [
    { n: '1a', label: 'Total amount from Form(s) W-2, box 1', value: '84,250', kind: 'calc' },
    { n: '2b', label: 'Taxable interest', value: '1,312', kind: 'calc' },
    { n: '8', label: 'Additional income from Schedule 1, line 10', value: '12,480', kind: 'calc' },
    { n: '10', label: 'Adjustments to income from Schedule 1, line 26', value: '882', kind: 'calc' },
    { n: '11', label: 'Adjusted gross income', value: '97,160', kind: 'calc' },
    { n: '12', label: 'Standard deduction or itemized deductions', value: '33,180', kind: 'override' },
    { n: '13', label: 'Qualified business income deduction', value: '2,320', kind: 'calc' },
    { n: '15', label: 'Taxable income', value: '61,660', kind: 'calc' },
  ],
};

// Portal features
const PORTAL_FEATURES = [
  {
    title: 'License your firm',
    body: 'Pick the plan that fits the number of preparers in the office and see the price before you commit. Change plans when the firm grows.',
  },
  {
    title: 'Download every release',
    body: 'Read what changed in each build of BAIT. Firms with an active license download the installer from the same page.',
  },
  {
    title: 'Report a bug, ask for a change',
    body: 'File a ticket against the return type and form it affects, then follow it from Open to In progress to Shipped.',
  },
];

// Desktop product features
const PRODUCT_FEATURES = [
  {
    title: 'Every screen is the IRS form',
    body: 'Preparers type on the form, not into a questionnaire. The forms in a return sit as tabs along the bottom of the window.',
  },
  {
    title: 'Color says where a number came from',
    body: 'Black is entered, blue is calculated, and red is overridden. Right-click a field to override it, restore it, or add a note.',
  },
  {
    title: 'Check Return before anyone else does',
    body: 'Errors that block e-file, warnings, overrides, and information, each one a click from the field it is about.',
  },
  {
    title: 'Client data stays on your computers',
    body: 'Returns live in an encrypted database on the firm’s own machines. This portal holds your account, license, and tickets, and nothing about your clients.',
  },
];

function home(req, res) {
  res.render('home', {
    pageTitle: 'Licenses, releases, and support for your firm',
    active: 'home',
    sample: SAMPLE_RETURN,
    portalFeatures: PORTAL_FEATURES,
    productFeatures: PRODUCT_FEATURES,
  });
}

module.exports = { home };

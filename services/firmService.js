// Validate firm accounts and handle registration and sign in
const dataStore = require('./dataStore');
const licenseService = require('./licenseService');
const { hashPassword, verifyPassword } = require('./passwords');

const { Firm } = dataStore;

const RULES = Object.freeze({
  NAME_MAX: 80,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 200,
  PREPARERS_MIN: 1,
  PREPARERS_MAX: 500,
});

const SIGN_IN_FAILED = 'The email or password is not correct.';

// Run the password check for unknown emails to reduce timing differences
const NO_ACCOUNT_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Validate the preparer count
function checkPreparerCount(preparerCount) {
  const ok = Number.isInteger(preparerCount)
    && preparerCount >= RULES.PREPARERS_MIN
    && preparerCount <= RULES.PREPARERS_MAX;
  return ok ? null : `Enter a whole number of preparers from ${RULES.PREPARERS_MIN} to ${RULES.PREPARERS_MAX}.`;
}

// Validate registration fields and reject duplicate emails before adding the firm
async function registerFirm({ name, email, password, preparerCount }) {
  const errors = {};
  const firmName = String(name || '').trim();
  const firmEmail = normalizeEmail(email);
  const firmPassword = String(password || '');

  if (!firmName) {
    errors.name = 'Enter the firm name.';
  } else if (firmName.length > RULES.NAME_MAX) {
    errors.name = `Use ${RULES.NAME_MAX} characters or fewer for the firm name.`;
  }

  if (!firmEmail) {
    errors.email = 'Enter the contact email.';
  } else if (dataStore.findFirmByEmail(firmEmail)) {
    errors.email = 'An account with this email already exists. Sign in instead.';
  }

  if (firmPassword.length < RULES.PASSWORD_MIN) {
    errors.password = `Use at least ${RULES.PASSWORD_MIN} characters for the password.`;
  } else if (firmPassword.length > RULES.PASSWORD_MAX) {
    errors.password = `Use ${RULES.PASSWORD_MAX} characters or fewer for the password.`;
  }

  const countError = checkPreparerCount(preparerCount);
  if (countError) {
    errors.preparerCount = countError;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const passwordHash = await hashPassword(firmPassword);

  // Recheck the email after hashing to catch duplicate registrations
  if (dataStore.findFirmByEmail(firmEmail)) {
    return { ok: false, errors: { email: 'An account with this email already exists. Sign in instead.' } };
  }

  const firm = new Firm({
    firmId: dataStore.nextId('firm'),
    name: firmName,
    email: firmEmail,
    passwordHash,
    preparerCount,
  });
  dataStore.store.firms.push(firm);

  return { ok: true, firm };
}

// Use the same failure message for unknown emails and incorrect passwords
async function signIn(email, password) {
  const firm = dataStore.findFirmByEmail(normalizeEmail(email));
  const matches = await verifyPassword(String(password || ''), firm ? firm.passwordHash : NO_ACCOUNT_HASH);

  if (!firm || !matches) {
    return { ok: false, message: SIGN_IN_FAILED };
  }
  return { ok: true, firm };
}

// Validate the new preparer count against the active plan seat limit
async function updatePreparerCount(firm, preparerCount, today = new Date()) {
  if (firm.isAdmin()) {
    return { ok: false, errors: {}, reason: 'An administrator account has no preparers.' };
  }

  const countError = checkPreparerCount(preparerCount);
  if (countError) {
    return { ok: false, errors: { preparerCount: countError }, reason: null };
  }

  const reason = await licenseService.seatRefusalFor(firm, preparerCount, today);
  if (reason) {
    return { ok: false, errors: {}, reason };
  }

  const previous = firm.preparerCount;
  firm.preparerCount = preparerCount;
  return { ok: true, firm, previous };
}

// Customer firms sorted by name without the administrator
async function listFirms() {
  return dataStore.store.firms
    .filter((firm) => !firm.isAdmin())
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  registerFirm,
  signIn,
  listFirms,
  updatePreparerCount,
  checkPreparerCount,
  RULES,
};

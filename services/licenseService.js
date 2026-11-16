// Enforce plan limits and manage firm licenses
const dataStore = require('./dataStore');

const { License } = dataStore;

const LICENSE_YEARS = 1;

function seats(count) {
  return count === 1 ? '1 seat' : `${count} seats`;
}

function preparers(count) {
  return count === 1 ? '1 preparer' : `${count} preparers`;
}

// Find the active license or return null
function findActiveLicense(firmId, today = new Date()) {
  return dataStore.licensesOfFirm(firmId).find((license) => license.isActive(today)) || null;
}

// Return the reason a plan cannot be selected or null when allowed
function refusalFor(firm, plan, activeLicense) {
  if (firm.isAdmin()) {
    return 'An administrator account does not hold a license.';
  }
  if (!plan.hasRoomFor(firm.preparerCount)) {
    return `The ${plan.name} plan has ${seats(plan.seatLimit)} and your firm has ${preparers(firm.preparerCount)}. Choose a plan with at least ${seats(firm.preparerCount)}.`;
  }
  if (activeLicense && activeLicense.planId === plan.planId) {
    return `Your firm already has the ${plan.name} plan.`;
  }
  return null;
}

// Plans ordered by seat limit
async function listPlans() {
  return [...dataStore.store.plans].sort((a, b) => a.seatLimit - b.seatLimit);
}

// Return the active license with its plan and yearly price or null
async function currentLicenseOf(firm, today = new Date()) {
  const license = findActiveLicense(firm.firmId, today);
  if (!license) return null;

  const plan = dataStore.findPlanById(license.planId);
  return { license, plan, price: plan.priceFor(firm.preparerCount) };
}

// Check the active plan seat limit before changing the preparer count
async function seatRefusalFor(firm, preparerCount, today = new Date()) {
  const license = findActiveLicense(firm.firmId, today);
  if (!license) return null;

  const plan = dataStore.findPlanById(license.planId);
  if (plan.hasRoomFor(preparerCount)) return null;

  return `The ${plan.name} plan has ${seats(plan.seatLimit)}, so your firm cannot have ${preparers(preparerCount)} on it. Change to a plan with at least ${seats(preparerCount)} first.`;
}

// Firm license history with plan details and active status ordered newest first
async function licenseHistoryOf(firm, today = new Date()) {
  return dataStore.licensesOfFirm(firm.firmId)
    .sort((a, b) => b.licenseId - a.licenseId)
    .map((license) => ({
      license,
      plan: dataStore.findPlanById(license.planId),
      isActive: license.isActive(today),
    }));
}

// Add firm pricing and eligibility to each plan when an account is present
async function plansFor(firm, today = new Date()) {
  const plans = await listPlans();
  const activeLicense = firm ? findActiveLicense(firm.firmId, today) : null;

  return plans.map((plan) => {
    if (!firm) {
      return { plan, price: null, isCurrent: false, canChoose: false, reason: null };
    }
    const reason = refusalFor(firm, plan, activeLicense);
    return {
      plan,
      price: plan.priceFor(firm.preparerCount),
      isCurrent: Boolean(activeLicense) && activeLicense.planId === plan.planId,
      canChoose: reason === null,
      reason,
    };
  });
}

// Create a license and return the previous plan when switching
async function choosePlan(firm, planId, today = new Date()) {
  const plan = dataStore.findPlanById(planId);
  if (!plan) {
    return { ok: false, reason: 'Choose one of the listed plans.' };
  }

  const activeLicense = findActiveLicense(firm.firmId, today);
  const reason = refusalFor(firm, plan, activeLicense);
  if (reason) {
    return { ok: false, reason };
  }

  // End active licenses today and preserve existing expiration dates for expired ones
  for (const old of dataStore.licensesOfFirm(firm.firmId)) {
    if (old.isActive(today)) {
      old.expire(today);
    } else if (old.status === License.STATUSES.ACTIVE) {
      old.status = License.STATUSES.EXPIRED;
    }
  }

  const expiresOn = new Date(today);
  expiresOn.setFullYear(expiresOn.getFullYear() + LICENSE_YEARS);

  const license = new License({
    licenseId: dataStore.nextId('license'),
    firmId: firm.firmId,
    planId: plan.planId,
    startDate: today,
    expiresOn,
  });
  dataStore.store.licenses.push(license);

  return {
    ok: true,
    license,
    plan,
    price: plan.priceFor(firm.preparerCount),
    replacedPlan: activeLicense ? dataStore.findPlanById(activeLicense.planId) : null,
  };
}

module.exports = {
  listPlans,
  plansFor,
  currentLicenseOf,
  choosePlan,
  seatRefusalFor,
  licenseHistoryOf,
};

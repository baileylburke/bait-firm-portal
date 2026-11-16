// Load plans and handle plan selection through LicenseService
const licenseService = require('../services/licenseService');
const { setFlash } = require('../middleware/session');
const { money } = require('../middleware/viewHelpers');

const PLANS = '/plans';

async function renderPlans(req, res, { status = 200, refusal = null } = {}) {
  const [plans, current] = await Promise.all([
    licenseService.plansFor(req.firm),
    req.firm ? licenseService.currentLicenseOf(req.firm) : null,
  ]);

  res.status(status).render('plans', {
    pageTitle: 'License plans',
    active: 'plans',
    plans,
    current,
    refusal,
  });
}

// GET /plans
async function showPlans(req, res, next) {
  try {
    await renderPlans(req, res);
  } catch (err) {
    next(err);
  }
}

// POST /plans/choose
async function choosePlan(req, res, next) {
  try {
    const { ok, values } = req.validated;
    if (!ok) {
      return await renderPlans(req, res, { status: 422, refusal: 'Choose one of the listed plans.' });
    }

    const result = await licenseService.choosePlan(req.firm, values.planId);
    if (!result.ok) {
      // Show the reason returned by the service
      return await renderPlans(req, res, { status: 409, refusal: result.reason });
    }

    const { plan, price, replacedPlan } = result;
    const message = replacedPlan
      ? `Your firm changed from the ${replacedPlan.name} plan to the ${plan.name} plan: ${money(price)} a year.`
      : `Your firm now has the ${plan.name} plan: ${money(price)} a year.`;
    setFlash(req, 'ok', message);
    res.redirect(PLANS);
  } catch (err) {
    next(err);
  }
}

module.exports = { showPlans, choosePlan };

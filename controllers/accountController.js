// Load account details and handle preparer count changes
const firmService = require('../services/firmService');
const licenseService = require('../services/licenseService');
const ticketService = require('../services/ticketService');
const { setFlash } = require('../middleware/session');
const { money, plural } = require('../middleware/viewHelpers');

const ACCOUNT = '/account';
const TICKETS_SHOWN = 5;

async function renderAccount(req, res, { status = 200, values = {}, errors = {}, refusal = null } = {}) {
  const [current, history, recent] = await Promise.all([
    licenseService.currentLicenseOf(req.firm),
    licenseService.licenseHistoryOf(req.firm),
    ticketService.recentTicketsOf(req.firm, TICKETS_SHOWN),
  ]);

  res.status(status).render('account', {
    pageTitle: 'My Account',
    active: 'account',
    current,
    history,
    tickets: recent.tickets,
    ticketTotal: recent.total,
    rules: firmService.RULES,
    values,
    errors,
    refusal,
  });
}

// GET /account
async function showAccount(req, res, next) {
  try {
    await renderAccount(req, res);
  } catch (err) {
    next(err);
  }
}

// POST /account/preparers
async function updatePreparers(req, res, next) {
  try {
    const { ok, values, errors } = req.validated;
    if (!ok) {
      return await renderAccount(req, res, { status: 422, values, errors });
    }

    const result = await firmService.updatePreparerCount(req.firm, values.preparerCount);
    if (!result.ok) {
      // Use 422 for invalid fields and 409 for seat limit conflicts
      return await renderAccount(req, res, {
        status: result.reason ? 409 : 422,
        values,
        errors: result.errors,
        refusal: result.reason,
      });
    }

    const { firm, previous } = result;
    if (previous === firm.preparerCount) {
      setFlash(req, 'info', `Your firm already has ${plural(firm.preparerCount, 'preparer')}. Nothing changed.`);
      return res.redirect(ACCOUNT);
    }

    // Recalculate the yearly price after a preparer count change
    const current = await licenseService.currentLicenseOf(firm);
    const priceNote = current ? ` The ${current.plan.name} plan is now ${money(current.price)} a year.` : '';
    setFlash(req, 'ok', `Your firm now has ${plural(firm.preparerCount, 'preparer')}.${priceNote}`);
    res.redirect(ACCOUNT);
  } catch (err) {
    next(err);
  }
}

module.exports = { showAccount, updatePreparers };

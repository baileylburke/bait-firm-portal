// Load firm tickets and handle ticket submissions
const ticketService = require('../services/ticketService');
const { setFlash } = require('../middleware/session');

const SUPPORT = '/support';

async function renderSupport(req, res, { status = 200, values = {}, errors = {}, reason = null } = {}) {
  const [choices, tickets, counts] = await Promise.all([
    ticketService.formChoices(),
    ticketService.ticketsOf(req.firm),
    ticketService.countsOf(req.firm),
  ]);

  res.status(status).render('support', {
    pageTitle: 'Support',
    active: 'support',
    choices,
    tickets,
    counts,
    values,
    errors,
    reason,
  });
}

// GET /support
async function showSupport(req, res, next) {
  try {
    await renderSupport(req, res);
  } catch (err) {
    next(err);
  }
}

// POST /support/tickets
async function fileTicket(req, res, next) {
  try {
    const { ok, values, errors } = req.validated;
    if (!ok) {
      return await renderSupport(req, res, { status: 422, values, errors });
    }

    const result = await ticketService.fileTicket(req.firm, values);
    if (!result.ok) {
      // Use 422 for invalid fields and 409 when the account cannot file tickets
      return await renderSupport(req, res, {
        status: result.reason ? 409 : 422,
        values,
        errors: result.errors,
        reason: result.reason,
      });
    }

    const { ticket } = result;
    setFlash(req, 'ok', `Ticket #${ticket.ticketId} is open: ${ticket.typeLabel().toLowerCase()} for ${ticket.returnType}, ${ticket.form}. Its status shows in the list below.`);
    res.redirect(SUPPORT);
  } catch (err) {
    next(err);
  }
}

module.exports = { showSupport, fileTicket };

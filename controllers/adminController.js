// Load the admin overview and handle ticket status changes
const adminService = require('../services/adminService');
const ticketService = require('../services/ticketService');
const { HttpError } = require('../middleware/errorHandlers');
const { setFlash } = require('../middleware/session');

const ADMIN = '/admin';

async function renderAdmin(req, res, { status = 200, refusal = null, refusedTicketId = null, chosen = {} } = {}) {
  const view = await adminService.overview(req.firm);
  if (!view.ok) {
    throw new HttpError(403, view.reason);
  }

  res.status(status).render('admin', {
    pageTitle: 'Admin',
    active: 'admin',
    firms: view.firms,
    licenses: view.licenses,
    tickets: view.tickets,
    releases: view.releases,
    totals: view.totals,
    refusal,
    refusedTicketId,
    chosen,
  });
}

// GET /admin
async function showAdmin(req, res, next) {
  try {
    await renderAdmin(req, res);
  } catch (err) {
    next(err);
  }
}

// POST /admin/tickets/:ticketId/status
async function moveTicket(req, res, next) {
  try {
    const { values } = req.validated;
    const result = await ticketService.moveTicket(req.firm, req.params.ticketId, values.status, {
      shippedIn: values.shippedIn,
    });

    if (!result.ok) {
      const { CODES } = ticketService;
      if (result.code === CODES.NOT_FOUND) {
        throw new HttpError(404, result.reason);
      }
      if (result.code === CODES.NOT_ADMIN) {
        throw new HttpError(403, result.reason);
      }
      // Use 422 for missing input and 409 for invalid status changes
      return await renderAdmin(req, res, {
        status: result.code === CODES.INPUT ? 422 : 409,
        refusal: result.reason,
        refusedTicketId: Number(req.params.ticketId),
        chosen: values,
      });
    }

    const { ticket } = result;
    const where = ticket.isShipped() ? ` in BAIT ${ticket.shippedIn}` : '';
    setFlash(req, 'ok', `Ticket #${ticket.ticketId} is now ${ticket.status}${where}.`);
    res.redirect(ADMIN);
  } catch (err) {
    next(err);
  }
}

module.exports = { showAdmin, moveTicket };

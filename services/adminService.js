// Collect account and ticket details for the admin page
const dataStore = require('./dataStore');
const firmService = require('./firmService');
const licenseService = require('./licenseService');
const ticketService = require('./ticketService');
const releaseService = require('./releaseService');

const ADMIN_ONLY = 'Only the administrator can see every firm, license, and ticket.';

// Return linked records and totals for an administrator
async function overview(actor, today = new Date()) {
  if (!actor || !actor.isAdmin()) {
    return { ok: false, reason: ADMIN_ONLY };
  }

  const [firmList, licenseList, ticketList, byStatus, releases] = await Promise.all([
    firmService.listFirms(),
    licenseService.allLicenses(today),
    ticketService.allTickets(),
    ticketService.countsOfAll(),
    releaseService.publishedReleases(today),
  ]);

  const licenses = licenseList.map((row) => ({
    ...row,
    firm: dataStore.findFirmById(row.license.firmId),
  }));

  const tickets = ticketList.map((ticket) => ({
    ticket,
    firm: dataStore.findFirmById(ticket.firmId),
    next: ticketService.nextStatusOf(ticket),
  }));

  const firms = firmList.map((firm) => {
    const active = licenses.find((row) => row.isActive && row.license.firmId === firm.firmId) || null;
    return {
      firm,
      plan: active ? active.plan : null,
      price: active ? active.plan.priceFor(firm.preparerCount) : null,
      ticketCount: ticketList.filter((ticket) => ticket.firmId === firm.firmId).length,
    };
  });

  const withLicense = firms.filter((row) => row.plan !== null);

  return {
    ok: true,
    firms,
    licenses,
    tickets,
    releases,
    totals: {
      firms: firms.length,
      activeLicenses: withLicense.length,
      yearlyTotal: withLicense.reduce((sum, row) => sum + row.price, 0),
      tickets: tickets.length,
      byStatus,
    },
  };
}

module.exports = { overview, ADMIN_ONLY };

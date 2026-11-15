// Store records in memory and reload seed data on restart
const Firm = require('./objects/Firm');
const Plan = require('./objects/Plan');
const License = require('./objects/License');
const Release = require('./objects/Release');
const Ticket = require('./objects/Ticket');
const { hashPasswordSync } = require('./passwords');

const store = {
  firms: [],
  plans: [],
  licenses: [],
  releases: [],
  tickets: [],
};

// Next ID for each record type
const counters = { firm: 1, license: 1, ticket: 1001 };

function nextId(kind) {
  const id = counters[kind];
  counters[kind] += 1;
  return id;
}

// lookups

function findFirmById(firmId) {
  return store.firms.find((firm) => firm.firmId === firmId) || null;
}

function findFirmByEmail(email) {
  const wanted = String(email).trim().toLowerCase();
  return store.firms.find((firm) => firm.email === wanted) || null;
}

function findPlanById(planId) {
  return store.plans.find((plan) => plan.planId === planId) || null;
}

function findReleaseByVersion(version) {
  return store.releases.find((release) => release.version === version) || null;
}

function findTicketById(ticketId) {
  return store.tickets.find((ticket) => ticket.ticketId === ticketId) || null;
}

function licensesOfFirm(firmId) {
  return store.licenses.filter((license) => license.firmId === firmId);
}

function ticketsOfFirm(firmId) {
  return store.tickets.filter((ticket) => ticket.firmId === firmId);
}

// seed data

function seed() {
  store.plans.push(
    new Plan({
      planId: 'solo',
      name: 'Solo',
      seatLimit: 1,
      pricePerSeat: 1200,
      returnTypes: ['1040'],
      efileIncluded: false,
    }),
    new Plan({
      planId: 'practice',
      name: 'Practice',
      seatLimit: 10,
      pricePerSeat: 950,
      returnTypes: ['1040', '1065', '1120-S'],
      efileIncluded: true,
    }),
    new Plan({
      planId: 'enterprise',
      name: 'Enterprise',
      seatLimit: 50,
      pricePerSeat: 800,
      returnTypes: ['1040', '1065', '1120-S', '1120', '1041', '990', '706', '709'],
      efileIncluded: true,
    }),
  );

  store.releases.push(
    new Release({
      version: '0.1.14',
      releaseDate: new Date('2026-10-30'),
      notes: 'New return types for homeowners associations, gift tax, and foreign corporations, and the finish-out of the 1041 and 1120.',
      returnTypesAdded: ['1120-H', '709', '1120-F'],
      downloadFile: 'BAIT-Setup-0.1.14.txt',
    }),
    new Release({
      version: '0.1.18',
      releaseDate: new Date('2026-11-01'),
      notes: 'Estate tax, benefit plan, and heavy vehicle use tax returns, and a round of fixes from the test log.',
      returnTypesAdded: ['1040-SS', '706', '5500', '2290'],
      downloadFile: 'BAIT-Setup-0.1.18.txt',
    }),
    new Release({
      version: '0.1.32',
      releaseDate: new Date('2026-11-14'),
      notes: 'Fixes and requested changes across the individual and business returns. No new return types.',
      returnTypesAdded: [],
      downloadFile: 'BAIT-Setup-0.1.32.txt',
    }),
  );

  // Use ADMIN_PASSWORD when set and reserve the fallback for local demos
  store.firms.push(
    new Firm({
      firmId: nextId('firm'),
      name: 'BAIT Administration',
      email: 'admin@bait.tax',
      passwordHash: hashPasswordSync(process.env.ADMIN_PASSWORD || 'bait-admin-demo'),
      preparerCount: 1,
      role: Firm.ROLES.ADMIN,
    }),
  );
}

seed();

module.exports = {
  store,
  nextId,
  findFirmById,
  findFirmByEmail,
  findPlanById,
  findReleaseByVersion,
  findTicketById,
  licensesOfFirm,
  ticketsOfFirm,
  // Export the record classes for services
  Firm,
  Plan,
  License,
  Release,
  Ticket,
};

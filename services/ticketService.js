// Validate tickets and enforce forward status changes by an administrator
const dataStore = require('./dataStore');

const { Ticket } = dataStore;
const { TYPES, STATUSES } = Ticket;

const RULES = Object.freeze({
  FORM_MAX: 40,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
});

// Ticket types in form order
const TYPE_CHOICES = Object.freeze([
  { value: TYPES.BUG, label: 'Bug report', hint: 'Something in BAIT gives a wrong result or does not work.' },
  { value: TYPES.CHANGE, label: 'Change request', hint: 'Something BAIT does not do yet, or could do better.' },
]);

// Supported return types from all plans
const RETURN_TYPES = Object.freeze(
  [...new Set(dataStore.store.plans.flatMap((plan) => plan.returnTypes))],
);

// Allowed ticket status order
const STATUS_ORDER = Object.freeze([STATUSES.OPEN, STATUSES.IN_PROGRESS, STATUSES.SHIPPED]);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// filing

// Ticket form options and field limits
async function formChoices() {
  return { types: TYPE_CHOICES, returnTypes: RETURN_TYPES, rules: RULES };
}

// Return cleaned ticket fields and validation errors
function checkTicketInput({ type, returnType, form, description } = {}) {
  const values = {
    type: text(type),
    returnType: text(returnType),
    form: text(form),
    description: text(description),
  };
  const errors = {};

  if (!TYPE_CHOICES.some((choice) => choice.value === values.type)) {
    errors.type = 'Choose bug report or change request.';
  }

  if (!RETURN_TYPES.includes(values.returnType)) {
    errors.returnType = 'Choose the return type.';
  }

  if (!values.form) {
    errors.form = 'Enter the form or schedule, for example Schedule C.';
  } else if (values.form.length > RULES.FORM_MAX) {
    errors.form = `Use ${RULES.FORM_MAX} characters or fewer for the form.`;
  }

  if (!values.description) {
    errors.description = 'Describe the problem or the change.';
  } else if (values.description.length < RULES.DESCRIPTION_MIN) {
    errors.description = `Use at least ${RULES.DESCRIPTION_MIN} characters, so the developer can understand the ticket.`;
  } else if (values.description.length > RULES.DESCRIPTION_MAX) {
    errors.description = `Use ${RULES.DESCRIPTION_MAX} characters or fewer for the description.`;
  }

  return { values, errors };
}

// Return a reason when the account cannot file a ticket
function filingRefusalFor(firm) {
  if (firm.isAdmin()) {
    return 'An administrator account does not file tickets.';
  }
  return null;
}

// Create an Open ticket after checking the account and fields
async function fileTicket(firm, input, today = new Date()) {
  const reason = filingRefusalFor(firm);
  if (reason) {
    return { ok: false, errors: {}, reason };
  }

  const { values, errors } = checkTicketInput(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, reason: null };
  }

  const ticket = new Ticket({
    ticketId: dataStore.nextId('ticket'),
    firmId: firm.firmId,
    type: values.type,
    returnType: values.returnType,
    form: values.form,
    description: values.description,
    status: STATUSES.OPEN,
    createdOn: today,
  });
  dataStore.store.tickets.push(ticket);

  return { ok: true, ticket };
}

// Firm tickets ordered newest first
async function ticketsOf(firm) {
  return dataStore.ticketsOfFirm(firm.firmId).sort((a, b) => b.ticketId - a.ticketId);
}

// Recent firm tickets and total count
async function recentTicketsOf(firm, limit = 5) {
  const tickets = await ticketsOf(firm);
  return { tickets: tickets.slice(0, limit), total: tickets.length };
}

// Count firm tickets by status
async function countsOf(firm) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const ticket of dataStore.ticketsOfFirm(firm.firmId)) {
    counts[ticket.status] += 1;
  }
  return counts;
}

// status rules

// Return the next status or null when already Shipped
function nextStatusOf(ticket) {
  const position = STATUS_ORDER.indexOf(ticket.status);
  return position >= 0 && position < STATUS_ORDER.length - 1 ? STATUS_ORDER[position + 1] : null;
}

// Check that the release exists and is published
function isPublished(release, today) {
  return Boolean(release) && release.releaseDate <= today;
}

// Advance the ticket one status and require a published release for Shipped
async function moveTicket(actor, ticketId, newStatus, { shippedIn } = {}, today = new Date()) {
  if (!actor || !actor.isAdmin()) {
    return { ok: false, reason: 'Only the administrator can change the status of a ticket.' };
  }

  const ticket = dataStore.findTicketById(Number(ticketId));
  if (!ticket) {
    return { ok: false, reason: 'The portal has no ticket with that number.' };
  }

  if (!STATUS_ORDER.includes(newStatus)) {
    return { ok: false, reason: 'Choose one of the listed statuses.' };
  }

  const next = nextStatusOf(ticket);
  if (next === null) {
    return { ok: false, reason: `Ticket #${ticket.ticketId} is Shipped. A shipped ticket does not change.` };
  }
  if (newStatus !== next) {
    return {
      ok: false,
      reason: `Ticket #${ticket.ticketId} is ${ticket.status}. Its next status is ${next}; a ticket moves one step at a time and does not go back.`,
    };
  }

  if (newStatus === STATUSES.SHIPPED) {
    const version = text(shippedIn);
    if (!version) {
      return { ok: false, reason: 'Choose the release that ships this ticket.' };
    }
    const release = dataStore.findReleaseByVersion(version);
    if (!isPublished(release, today)) {
      return { ok: false, reason: `BAIT ${version} is not a published release. A ticket ships only in a published release.` };
    }
    ticket.shippedIn = release.version;
  }

  ticket.status = newStatus;
  return { ok: true, ticket };
}

module.exports = {
  formChoices,
  fileTicket,
  ticketsOf,
  recentTicketsOf,
  countsOf,
  nextStatusOf,
  moveTicket,
  RULES,
  TYPE_CHOICES,
  RETURN_TYPES,
  STATUS_ORDER,
};

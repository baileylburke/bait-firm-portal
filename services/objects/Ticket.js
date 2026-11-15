// A support ticket with the closing release version stored in shippedIn
const TYPES = Object.freeze({ BUG: 'bug', CHANGE: 'change' });
const STATUSES = Object.freeze({ OPEN: 'Open', IN_PROGRESS: 'In progress', SHIPPED: 'Shipped' });

class Ticket {
  constructor({ ticketId, firmId, type, returnType, form, description, status = STATUSES.OPEN, shippedIn = null, createdOn = new Date() }) {
    this.ticketId = ticketId;
    this.firmId = firmId;
    this.type = type;
    this.returnType = returnType;
    this.form = form;
    this.description = description;
    this.status = status;
    this.shippedIn = shippedIn;
    this.createdOn = createdOn;
  }

  isShipped() {
    return this.status === STATUSES.SHIPPED;
  }

  // Ticket type label for display
  typeLabel() {
    return this.type === TYPES.BUG ? 'Bug report' : 'Change request';
  }
}

Ticket.TYPES = TYPES;
Ticket.STATUSES = STATUSES;

module.exports = Ticket;

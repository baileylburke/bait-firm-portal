// A firm license linked to a plan
const STATUSES = Object.freeze({ ACTIVE: 'active', EXPIRED: 'expired' });

class License {
  constructor({ licenseId, firmId, planId, startDate, expiresOn, status = STATUSES.ACTIVE }) {
    this.licenseId = licenseId;
    this.firmId = firmId;
    this.planId = planId;
    this.startDate = startDate;
    this.expiresOn = expiresOn;
    this.status = status;
  }

  // Check status and expiration
  isActive(today = new Date()) {
    return this.status === STATUSES.ACTIVE && today <= this.expiresOn;
  }

  // Expire the license now
  expire(today = new Date()) {
    this.status = STATUSES.EXPIRED;
    this.expiresOn = today;
  }
}

License.STATUSES = STATUSES;

module.exports = License;

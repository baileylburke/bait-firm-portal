// A customer firm or portal administrator
const ROLES = Object.freeze({ FIRM: 'firm', ADMIN: 'admin' });

class Firm {
  constructor({ firmId, name, email, passwordHash, preparerCount, role = ROLES.FIRM }) {
    this.firmId = firmId;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.preparerCount = preparerCount;
    this.role = role;
  }

  isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  // Exclude the password hash from view and session data
  toPublic() {
    return {
      firmId: this.firmId,
      name: this.name,
      email: this.email,
      preparerCount: this.preparerCount,
      role: this.role,
    };
  }
}

Firm.ROLES = ROLES;

module.exports = Firm;

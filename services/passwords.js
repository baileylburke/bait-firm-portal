// Store salted scrypt hashes as hex salt and key pairs
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;

function newSalt() {
  return crypto.randomBytes(16).toString('hex');
}

async function hashPassword(password) {
  const salt = newSalt();
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString('hex')}`;
}

function hashPasswordSync(password) {
  const salt = newSalt();
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  const expected = Buffer.from(key, 'hex');
  const actual = await scrypt(password, salt, KEY_LENGTH);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, hashPasswordSync, verifyPassword };

// Keep account IDs and flash messages in memory with a signed session cookie
const crypto = require('crypto');
const session = require('express-session');

const TWO_HOURS = 2 * 60 * 60 * 1000;

const sessions = session({
  name: 'bfp.sid',
  // Generate a secret when none is configured since sessions reset on restart
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TWO_HOURS,
  },
});

// Replace the session with an empty one
function newSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
}

// Regenerate the session ID before storing the firm ID
async function startSession(req, firm) {
  await newSession(req);
  req.session.firmId = firm.firmId;
}

// Clear the old session on sign out
async function endSession(req) {
  await newSession(req);
}

// Save an ok, error, or info message for the next page
function setFlash(req, kind, text) {
  req.session.flash = { kind, text };
}

// Read and clear the flash message
function flashToView(req, res, next) {
  res.locals.flash = null;
  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
}

module.exports = { sessions, startSession, endSession, setFlash, flashToView };

// Load the current account and guard restricted routes
const dataStore = require('../services/dataStore');
const { HttpError } = require('./errorHandlers');
const { setFlash } = require('./session');

const SIGN_IN_PATH = '/sign-in';

// Load req.firm and expose the account without its password hash to views
function loadCurrentFirm(req, res, next) {
  req.firm = null;
  res.locals.currentFirm = null;

  const firmId = req.session ? req.session.firmId : undefined;
  if (firmId !== undefined) {
    const firm = dataStore.findFirmById(firmId);
    if (firm) {
      req.firm = firm;
      res.locals.currentFirm = firm.toPublic();
    } else {
      // Clear stale account IDs
      delete req.session.firmId;
    }
  }
  next();
}

// Remember the requested path before redirecting to sign in
function sendToSignIn(req, res) {
  if (req.method === 'GET') {
    req.session.returnTo = req.originalUrl;
  }
  setFlash(req, 'info', 'Sign in to continue.');
  res.redirect(SIGN_IN_PATH);
}

function requireSignIn(req, res, next) {
  if (!req.firm) {
    return sendToSignIn(req, res);
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.firm) {
    return sendToSignIn(req, res);
  }
  if (!req.firm.isAdmin()) {
    return next(new HttpError(403, 'Only the administrator can open this page.'));
  }
  next();
}

module.exports = { loadCurrentFirm, requireSignIn, requireAdmin, SIGN_IN_PATH };

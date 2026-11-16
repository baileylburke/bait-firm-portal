// Handle account registration and sessions
const firmService = require('../services/firmService');
const { startSession, endSession, setFlash } = require('../middleware/session');

const HOME = '/';
const PLANS = '/plans';

function renderRegister(res, { status = 200, values = {}, errors = {} } = {}) {
  res.status(status).render('register', {
    pageTitle: 'Register your firm',
    active: 'register',
    values,
    errors,
    rules: firmService.RULES,
  });
}

function renderSignIn(res, { status = 200, values = {}, errors = {}, message = null } = {}) {
  res.status(status).render('sign-in', {
    pageTitle: 'Sign in',
    active: 'sign-in',
    values,
    errors,
    message,
  });
}

// Return to the requested local path or Home after sign in
function afterSignIn(returnTo) {
  const isLocalPath = typeof returnTo === 'string'
    && returnTo.startsWith('/')
    && !returnTo.startsWith('//')
    && !returnTo.includes('\\');
  return isLocalPath ? returnTo : HOME;
}

// GET /register
function showRegister(req, res) {
  if (req.firm) return res.redirect(HOME);
  renderRegister(res);
}

// POST /register
async function register(req, res, next) {
  try {
    if (req.firm) return res.redirect(HOME);

    const { ok, values, errors } = req.validated;
    // Never send the password back to the view
    const shown = { name: values.name, email: values.email, preparerCount: values.preparerCount };

    if (!ok) {
      return renderRegister(res, { status: 422, values: shown, errors });
    }

    const result = await firmService.registerFirm(values);
    if (!result.ok) {
      return renderRegister(res, { status: 422, values: shown, errors: result.errors });
    }

    await startSession(req, result.firm);
    setFlash(req, 'ok', `Welcome, ${result.firm.name}. Your firm account is ready. Choose a license plan to continue.`);
    res.redirect(PLANS);
  } catch (err) {
    next(err);
  }
}

// GET /sign-in
function showSignIn(req, res) {
  if (req.firm) return res.redirect(HOME);
  renderSignIn(res);
}

// POST /sign-in
async function signIn(req, res, next) {
  try {
    if (req.firm) return res.redirect(HOME);

    const { ok, values, errors } = req.validated;
    const shown = { email: values.email };

    if (!ok) {
      return renderSignIn(res, { status: 422, values: shown, errors });
    }

    const result = await firmService.signIn(values.email, values.password);
    if (!result.ok) {
      return renderSignIn(res, { status: 401, values: shown, message: result.message });
    }

    const destination = afterSignIn(req.session.returnTo);
    await startSession(req, result.firm);
    setFlash(req, 'ok', `You are signed in as ${result.firm.name}.`);
    res.redirect(destination);
  } catch (err) {
    next(err);
  }
}

// POST /sign-out
async function signOut(req, res, next) {
  try {
    await endSession(req);
    setFlash(req, 'info', 'You are signed out.');
    res.redirect(HOME);
  } catch (err) {
    next(err);
  }
}

module.exports = { showRegister, register, showSignIn, signIn, signOut };

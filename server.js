// Configure the HTTP server
const path = require('path');
const express = require('express');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const supportRoutes = require('./routes/supportRoutes');
const dataStore = require('./services/dataStore');

const securityHeaders = require('./middleware/security');
const requestLogger = require('./middleware/requestLogger');
const { sessions, flashToView } = require('./middleware/session');
const { loadCurrentFirm } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandlers');
const viewHelpers = require('./middleware/viewHelpers');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS templates and shared partials
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Site details shared by all views
app.locals.site = {
  name: 'BAIT Firm Portal',
  product: 'BAIT',
  productUrl: 'https://bait.tax',
  contact: 'hello@bait.tax',
};

// Register shared formatting helpers
Object.assign(app.locals, viewHelpers);

// middleware

// Set security headers
app.use(securityHeaders);

// Log completed requests
app.use(requestLogger);

// Serve public assets
app.use(express.static(path.join(__dirname, 'public')));

// Load sessions before parsing so error pages show the correct navigation
app.use(sessions);
app.use(flashToView);
app.use(loadCurrentFirm);

// Limit form and JSON request bodies
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));

// routes

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', planRoutes);
app.use('/', releaseRoutes);
app.use('/', supportRoutes);

// after the routes

// Handle unmatched routes
app.use(notFound);

// Register the error handler last
app.use(errorHandler);

// Listen only when run directly so importing the app does not open a port
if (require.main === module) {
  app.listen(PORT, () => {
    const { plans, releases, firms } = dataStore.store;
    console.log(`BAIT Firm Portal is running at http://localhost:${PORT}`);
    console.log(`In-memory store ready: ${plans.length} plans, ${releases.length} releases, ${firms.length} firm account(s).`);
  });
}

module.exports = app;

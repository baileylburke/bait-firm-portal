// Configure the HTTP server
const path = require('path');
const express = require('express');

const pageRoutes = require('./routes/pageRoutes');
const pageController = require('./controllers/pageController');
const dataStore = require('./services/dataStore');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS templates and shared partials
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve public assets
app.use(express.static(path.join(__dirname, 'public')));

// Site details shared by all views
app.locals.site = {
  name: 'BAIT Firm Portal',
  product: 'BAIT',
  productUrl: 'https://bait.tax',
  contact: 'hello@bait.tax',
};

app.use('/', pageRoutes);

// Handle unmatched routes
app.use(pageController.notFound);

app.listen(PORT, () => {
  const { plans, releases, firms } = dataStore.store;
  console.log(`BAIT Firm Portal is running at http://localhost:${PORT}`);
  console.log(`In-memory store ready: ${plans.length} plans, ${releases.length} releases, ${firms.length} firm account(s).`);
});

module.exports = app;

// Configure the HTTP server
const path = require('path');
const express = require('express');

const pageRoutes = require('./routes/pageRoutes');
const pageController = require('./controllers/pageController');

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
  console.log(`BAIT Firm Portal is running at http://localhost:${PORT}`);
});

module.exports = app;

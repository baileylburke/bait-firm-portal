// Formatting helpers shared through app.locals

// Format whole dollar prices
function money(amount) {
  return `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

// Format dates for display
function shortDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format a count with a singular or plural label
function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

module.exports = { money, shortDate, plural };

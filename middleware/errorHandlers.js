// Handle unmatched routes and errors passed to next

// HTTP error with a message that can be shown to the user
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.expose = true;
  }
}

const TITLES = {
  400: 'The request was not understood',
  401: 'Sign in first',
  403: 'Not allowed',
  404: 'Page not found',
  413: 'The request is too large',
};

function notFound(req, res) {
  res.status(404).render('not-found', {
    pageTitle: TITLES[404],
    active: '',
    path: req.originalUrl,
  });
}

// Express recognizes an error handler by its four parameters.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Let Express finish handling errors after headers are sent
  if (res.headersSent) {
    return next(err);
  }

  const given = Number(err.status || err.statusCode);
  const status = given >= 400 && given <= 599 ? given : 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(`Error on ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
  }

  // Show safe request errors and keep server error details in the log
  const showMessage = !isServerError && err.expose !== false && Boolean(err.message);
  const view = {
    pageTitle: TITLES[status] || (isServerError ? 'Something went wrong' : 'The request could not be completed'),
    active: '',
    status,
    message: showMessage
      ? err.message
      : 'The portal could not complete this request. Try again in a moment.',
  };

  res.status(status).render('error', view, (renderError, html) => {
    if (renderError) {
      // Use a plain response if rendering the error page fails
      console.error(renderError);
      return res.type('text/plain').send(`${status} - ${view.pageTitle}`);
    }
    res.send(html);
  });
}

module.exports = { HttpError, notFound, errorHandler };

// Set security headers and restrict page resources to this site
const helmet = require('helmet');

const inProduction = process.env.NODE_ENV === 'production';

const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      // Keep localhost on HTTP during development
      'upgrade-insecure-requests': inProduction ? [] : null,
    },
  },
});

module.exports = securityHeaders;

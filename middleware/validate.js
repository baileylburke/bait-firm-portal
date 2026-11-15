// Validate declared form fields and put values and errors on req.validated

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(raw, keepSpaces) {
  if (typeof raw !== 'string') return '';
  return keepSpaces ? raw : raw.trim();
}

// Checks return an error or a converted value and only required rejects empty input

function required(message = 'This field is required.') {
  return (text) => (text === '' ? { error: message } : undefined);
}

function minLength(length, message) {
  return (text) => (text !== '' && text.length < length
    ? { error: message || `Use at least ${length} characters.` }
    : undefined);
}

function maxLength(length, message) {
  return (text) => (text.length > length
    ? { error: message || `Use ${length} characters or fewer.` }
    : undefined);
}

function isEmail(message = 'Enter a valid email address.') {
  return (text) => {
    if (text === '') return undefined;
    if (text.length > 254 || !EMAIL_PATTERN.test(text)) return { error: message };
    return { value: text.toLowerCase() };
  };
}

function isWholeNumber({ min, max, message } = {}) {
  return (text) => {
    if (text === '') return undefined;
    const number = Number(text);
    const inRange = Number.isInteger(number)
      && /^\d+$/.test(text)
      && (min === undefined || number >= min)
      && (max === undefined || number <= max);
    if (inRange) return { value: number };
    if (message) return { error: message };
    if (min !== undefined && max !== undefined) return { error: `Enter a whole number from ${min} to ${max}.` };
    return { error: 'Enter a whole number.' };
  };
}

function oneOf(allowed, message = 'Choose one of the listed options.') {
  return (text) => (text !== '' && !allowed.includes(text) ? { error: message } : undefined);
}

// the validator

// Stop at the first failed check for each field
function validate(source, rules, { keepSpaces = [] } = {}) {
  const values = {};
  const errors = {};

  for (const [field, checks] of Object.entries(rules)) {
    let value = clean(source ? source[field] : undefined, keepSpaces.includes(field));
    for (const check of checks) {
      const result = check(String(value));
      if (result && result.error) {
        errors[field] = result.error;
        break;
      }
      if (result && result.value !== undefined) {
        value = result.value;
      }
    }
    values[field] = value;
  }

  return { ok: Object.keys(errors).length === 0, values, errors };
}

// Validate the request body using the route rules
function validateBody(rules, options) {
  return (req, res, next) => {
    req.validated = validate(req.body, rules, options);
    next();
  };
}

module.exports = {
  validate,
  validateBody,
  required,
  minLength,
  maxLength,
  isEmail,
  isWholeNumber,
  oneOf,
};

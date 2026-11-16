// Require sign in for support routes and validate ticket submissions
const express = require('express');
const supportController = require('../controllers/supportController');
const { requireSignIn } = require('../middleware/auth');
const { RULES, TYPE_CHOICES, RETURN_TYPES } = require('../services/ticketService');
const {
  validateBody, required, minLength, maxLength, oneOf,
} = require('../middleware/validate');

const router = express.Router();

const ticketFields = validateBody({
  type: [
    required('Choose bug report or change request.'),
    oneOf(TYPE_CHOICES.map((choice) => choice.value), 'Choose bug report or change request.'),
  ],
  returnType: [
    required('Choose the return type.'),
    oneOf(RETURN_TYPES, 'Choose the return type.'),
  ],
  form: [
    required('Enter the form or schedule, for example Schedule C.'),
    maxLength(RULES.FORM_MAX, `Use ${RULES.FORM_MAX} characters or fewer for the form.`),
  ],
  description: [
    required('Describe the problem or the change.'),
    minLength(RULES.DESCRIPTION_MIN, `Use at least ${RULES.DESCRIPTION_MIN} characters, so the developer can understand the ticket.`),
    maxLength(RULES.DESCRIPTION_MAX, `Use ${RULES.DESCRIPTION_MAX} characters or fewer for the description.`),
  ],
});

router.get('/support', requireSignIn, supportController.showSupport);
router.post('/support/tickets', requireSignIn, ticketFields, supportController.fileTicket);

module.exports = router;

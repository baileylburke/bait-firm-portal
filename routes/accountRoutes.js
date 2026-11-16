// Require sign in for account routes and validate preparer changes
const express = require('express');
const accountController = require('../controllers/accountController');
const { requireSignIn } = require('../middleware/auth');
const { RULES } = require('../services/firmService');
const { validateBody, required, isWholeNumber } = require('../middleware/validate');

const router = express.Router();

const preparerFields = validateBody({
  preparerCount: [
    required('Enter the number of preparers.'),
    isWholeNumber({ min: RULES.PREPARERS_MIN, max: RULES.PREPARERS_MAX }),
  ],
});

router.get('/account', requireSignIn, accountController.showAccount);
router.post('/account/preparers', requireSignIn, preparerFields, accountController.updatePreparers);

module.exports = router;

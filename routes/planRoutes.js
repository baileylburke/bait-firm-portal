// Public plan list and authenticated plan selection
const express = require('express');
const planController = require('../controllers/planController');
const { requireSignIn } = require('../middleware/auth');
const { validateBody, required, maxLength } = require('../middleware/validate');

const router = express.Router();

const planChoice = validateBody({
  planId: [required('Choose a plan.'), maxLength(40)],
});

router.get('/plans', planController.showPlans);
router.post('/plans/choose', requireSignIn, planChoice, planController.choosePlan);

module.exports = router;

// Account routes with validation for registration and sign in
const express = require('express');
const authController = require('../controllers/authController');
const { RULES } = require('../services/firmService');
const {
  validateBody, required, minLength, maxLength, isEmail, isWholeNumber,
} = require('../middleware/validate');

const router = express.Router();

const registerFields = validateBody({
  name: [required('Enter the firm name.'), maxLength(RULES.NAME_MAX)],
  email: [required('Enter the contact email.'), isEmail()],
  password: [
    required('Enter a password.'),
    minLength(RULES.PASSWORD_MIN, `Use at least ${RULES.PASSWORD_MIN} characters for the password.`),
    maxLength(RULES.PASSWORD_MAX),
  ],
  preparerCount: [
    required('Enter the number of preparers.'),
    isWholeNumber({ min: RULES.PREPARERS_MIN, max: RULES.PREPARERS_MAX }),
  ],
}, { keepSpaces: ['password'] });

const signInFields = validateBody({
  email: [required('Enter your email.'), isEmail()],
  password: [required('Enter your password.'), maxLength(RULES.PASSWORD_MAX)],
}, { keepSpaces: ['password'] });

router.get('/register', authController.showRegister);
router.post('/register', registerFields, authController.register);

router.get('/sign-in', authController.showSignIn);
router.post('/sign-in', signInFields, authController.signIn);

router.post('/sign-out', authController.signOut);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const auth = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  auth.register
);

router.post('/login', auth.login);
router.get('/me', authRequired, auth.me);
router.post('/forgot-password', auth.forgotPassword);

module.exports = router;

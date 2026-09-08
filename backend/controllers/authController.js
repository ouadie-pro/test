const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  // In a real application this would email a reset link. For demo purposes
  // we return success so the UI flow works end-to-end.
  const { email } = req.body;
  res.json({
    ok: true,
    message: email
      ? `If an account exists for ${email}, a reset link has been sent.`
      : 'Password reset email sent.',
  });
};

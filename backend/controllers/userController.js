const { v4: uuid } = require('uuid');
const User = require('../models/User');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.listApiKeys = async (req, res) => {
  res.json({ apiKeys: req.user.apiKeys || [] });
};

exports.createApiKey = async (req, res, next) => {
  try {
    const { label = 'Default' } = req.body;
    const key = `vfk_${uuid().replace(/-/g, '')}`;
    req.user.apiKeys.push({ key, label });
    await req.user.save();
    res.status(201).json({ apiKey: req.user.apiKeys[req.user.apiKeys.length - 1] });
  } catch (err) {
    next(err);
  }
};

exports.revokeApiKey = async (req, res, next) => {
  try {
    req.user.apiKeys = (req.user.apiKeys || []).filter((k) => k.key !== req.params.key);
    await req.user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

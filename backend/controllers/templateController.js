const Template = require('../models/Template');

exports.list = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    const templates = await Template.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ template });
  } catch (err) {
    next(err);
  }
};

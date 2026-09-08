const Asset = require('../models/Asset');
const { getStorage } = require('../services/storageService');

function publicUrl(req, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${req.protocol}://${req.get('host')}${value}`;
}

function formatAsset(req, a) {
  if (!a) return null;
  const obj = a.toObject ? a.toObject({ versionKey: false }) : a;
  obj.url = publicUrl(req, obj.url);
  return obj;
}

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const storage = getStorage();
    const saved = storage.save(req.file);
    const type = (req.file.mimetype || '').startsWith('video/') ? 'video' : 'image';
    const asset = await Asset.create({
      userId: req.user._id,
      type,
      url: saved.url,
      filename: saved.filename,
      mimeType: saved.mimeType,
      size: saved.size,
    });
    res.status(201).json({ asset: formatAsset(req, asset) });
  } catch (err) {
    if (err.message && err.message.includes('File too large')) {
      return res.status(413).json({ error: 'File too large', code: 'FILE_TOO_LARGE' });
    }
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { type, q, folder } = req.query;
    const filter = { userId: req.user._id };
    if (type && type !== 'all') filter.type = type;
    if (q) filter.filename = { $regex: q, $options: 'i' };
    if (folder === 'favorites') filter.isFavorite = true;
    let query = Asset.find(filter).sort({ createdAt: -1 });
    if (folder === 'recent') query = query.limit(60);
    const assets = await query;
    res.json({ assets: assets.map((a) => formatAsset(req, a)) });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    asset.isFavorite = !asset.isFavorite;
    await asset.save();
    res.json({ asset: formatAsset(req, asset) });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

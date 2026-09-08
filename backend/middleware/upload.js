const multer = require('multer');

const MAX_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '20', 10);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
});

module.exports = upload;

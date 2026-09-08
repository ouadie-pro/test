const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

/**
 * Storage abstraction. Today we support the local filesystem. To switch
 * to S3 / Cloudinary / R2, implement a new driver that exposes the same
 * `save(file)` and `publicUrl(filename)` methods, then select it from
 * STORAGE_DRIVER in the constructor.
 */
class LocalStorageDriver {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    this.publicBase = `/uploads`;
  }

  /**
   * Persist a Multer file object to disk and return a public URL.
   * @param {import('multer').MulterFile} file
   * @returns {{ url: string, filename: string, size: number, mimeType: string }}
   */
  save(file) {
    const ext = path.extname(file.originalname) || this._extFromMime(file.mimetype);
    const filename = `${Date.now()}_${uuid()}${ext}`;
    const dest = path.join(this.uploadDir, filename);
    fs.writeFileSync(dest, file.buffer);
    return {
      url: `${this.publicBase}/${filename}`,
      filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  publicUrl(filename) {
    return `${this.publicBase}/${filename}`;
  }

  _extFromMime(mime) {
    if (!mime) return '';
    const map = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
    };
    return map[mime] || '';
  }
}

function getStorage() {
  const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  switch (driver) {
    case 'local':
    default:
      return new LocalStorageDriver();
    // case 's3':    return new S3StorageDriver();
    // case 'r2':    return new R2StorageDriver();
    // case 'cloudinary': return new CloudinaryStorageDriver();
  }
}

module.exports = { getStorage };

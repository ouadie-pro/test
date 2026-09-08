const express = require('express');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/assetController');

const router = express.Router();
router.use(authRequired);

router.post('/upload', upload.single('file'), ctrl.upload);
router.get('/', ctrl.list);
router.post('/:id/favorite', ctrl.toggleFavorite);
router.delete('/:id', ctrl.remove);

module.exports = router;

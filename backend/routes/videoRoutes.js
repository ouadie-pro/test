const express = require('express');
const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/videoController');

const router = express.Router();

router.use(authRequired);

router.post('/generate', ctrl.generate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.delete('/:id', ctrl.remove);
router.post('/:id/cancel', ctrl.cancel);
router.post('/:id/retry', ctrl.retry);
router.post('/:id/view', ctrl.incrementView);

module.exports = router;

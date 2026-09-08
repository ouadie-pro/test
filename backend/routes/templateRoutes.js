const express = require('express');
const { authOptional } = require('../middleware/auth');
const ctrl = require('../controllers/templateController');

const router = express.Router();
router.use(authOptional);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

module.exports = router;

const express = require('express');
const { authRequired, authOptional } = require('../middleware/auth');
const ctrl = require('../controllers/creditController');

const router = express.Router();

router.get('/plans', authOptional, ctrl.listPlans);
router.get('/', authRequired, ctrl.getBalance);
router.post('/upgrade', authRequired, ctrl.upgrade);

module.exports = router;

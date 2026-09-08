const express = require('express');
const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const router = express.Router();
router.use(authRequired);

router.patch('/me', ctrl.updateProfile);
router.post('/me/password', ctrl.changePassword);
router.get('/me/api-keys', ctrl.listApiKeys);
router.post('/me/api-keys', ctrl.createApiKey);
router.delete('/me/api-keys/:key', ctrl.revokeApiKey);

module.exports = router;

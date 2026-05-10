const express = require('express');
const router = express.Router();
const errorLogController = require('../controllers/errorLog.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', errorLogController.getAll);
router.post('/resolve/:id', errorLogController.resolve);

module.exports = router;
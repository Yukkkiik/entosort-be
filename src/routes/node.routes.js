const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/node.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createNodeSchema } = require('../validations/node.validation');

router.use(authenticate);

router.get('/', nodeController.getAll);
router.get('/:id/status', nodeController.getStatus);
router.post('/', authorize('admin'), validate(createNodeSchema), nodeController.create);
router.put('/:id', authorize('admin'), nodeController.update);
router.delete('/:id', authorize('admin'), nodeController.remove);

module.exports = router;
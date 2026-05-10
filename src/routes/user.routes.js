const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', userController.getAll);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
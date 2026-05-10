const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validations/auth.validation');

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
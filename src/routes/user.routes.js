// src/routes/user.routes.js
const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/users
// superadmin: lihat admin | admin: lihat peternak miliknya
router.get('/', authorize('superadmin', 'admin'), userController.getAll);

// GET /api/users/:id
router.get('/:id', authorize('superadmin', 'admin'), userController.getById);

// POST /api/users
// superadmin: buat admin | admin: buat peternak
router.post('/', authorize('superadmin', 'admin'), userController.create);

// PUT /api/users/:id
// semua role boleh akses, pembatasan field ada di service
router.put('/:id', userController.update);

// DELETE /api/users/:id
// superadmin: hapus admin | admin: hapus peternak miliknya
router.delete('/:id', authorize('superadmin', 'admin'), userController.remove);

module.exports = router;
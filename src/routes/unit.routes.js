// src/routes/unit.routes.js
const router = require('express').Router();
const unitController = require('../controllers/unit.controller');
const { authenticate } = require('../middleware/auth');

// Semua route butuh login — validasi role dilakukan di service
router.use(authenticate);

// GET  /api/units       admin: lihat unit miliknya | peternak: lihat unitnya
// POST /api/units       superadmin: tambah unit baru
router.get('/',  unitController.getAll);
router.post('/', unitController.create);

// GET    /api/units/:id
// PUT    /api/units/:id   admin pemilik
// DELETE /api/units/:id   superadmin
router.get('/:id',    unitController.getStatus);
router.put('/:id',    unitController.update);
router.delete('/:id', unitController.remove);

// Assignment peternak — admin pemilik unit
router.post('/:unitId/assign-peternak',   unitController.assignPeternak);
router.delete('/:unitId/assign-peternak', unitController.removePeternak);

// Assignment admin — superadmin
router.post('/:unitId/assign-admin',   unitController.assignAdmin);
router.delete('/:unitId/assign-admin', unitController.removeAdmin);

module.exports = router;
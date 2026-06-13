const router = require('express').Router();
 
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/nodes', require('./node.routes'));
router.use('/units', require('./unit.routes'));
router.use('/sensor', require('./sensor.routes'));
router.use('/harvest', require('./harvest.routes'));
router.use('/control', require('./control.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/errors', require('./error.routes'));
router.use('/report', require('./report.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/ai', require('./ai.routes'));
 
module.exports = router;
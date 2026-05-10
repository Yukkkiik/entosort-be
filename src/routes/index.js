const express = require('express');
const router = express.Router();
 
const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes');
// const nodeRoutes = require('./node.routes');
// const sensorRoutes = require('./sensor.routes');
// const harvestRoutes = require('./harvest.routes');
// const controlRoutes = require('./control.routes');
// const settingsRoutes = require('./settings.routes');
// const errorRoutes = require('./error.routes');
// const reportRoutes = require('./report.routes');
// const dashboardRoutes = require('./dashboard.routes');
 
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/nodes', nodeRoutes);
// router.use('/sensor', sensorRoutes);
// router.use('/harvest', harvestRoutes);
// router.use('/control', controlRoutes);
// router.use('/settings', settingsRoutes);
// router.use('/errors', errorRoutes);
// router.use('/report', reportRoutes);
// router.use('/dashboard', dashboardRoutes);
 
module.exports = router;
const express = require('express');
const schedulesController = require('../controllers/schedulesController');
const authController = require('../controllers/authController');

const router = express.Router();

// Crear un nuevo horario
router.post('/schedules', schedulesController.createSchedule);


router.get('/schedules', schedulesController.getAllSchedules);

router.patch('/schedules/:schedule_id', schedulesController.updateSchedule);

router.put('/schedules/:schedule_id', schedulesController.updateSchedule);

router.get('/schedules/:schedule_id', schedulesController.getScheduleById);


module.exports = (app) => {
  // Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
  app.use('/web/api', authController.authenticateToken, router);
};

const express = require('express');
const schedulesController = require('../controllers/schedulesController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/schedules', schedulesController.createSchedule);


module.exports = (app) => {
  // Todas las rutas bajo la autenticacion `/web/api`, protegido por autenticación
  app.use('/web/api', authController.authenticateToken, router);
};

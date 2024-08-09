const express = require('express');
const authController = require('../controllers/authController');


module.exports = (app) => {
  const router = express.Router();

  router.post('/login', authController.login);
  router.post('/logout', authController.logout);
  router.get('/protected', authController.authenticateToken, authController.protectedRoute);

  app.use('/auth', router);  // Prefijo '/auth' para todas las rutas de autenticación
};

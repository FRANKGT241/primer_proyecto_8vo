const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/users', userController.createUser);

router.get('/users', userController.getAllUsers);

router.get('/users/:id', userController.getUserById);

router.put('/users/:id', userController.updateUser);

router.patch('/users/:id', userController.deleteUser);

module.exports = (app) => {
  // Todas las rutas bajo la autenticacion `/web/api`, protegido por autenticación
  app.use('/web/api', authController.authenticateToken, router);
};

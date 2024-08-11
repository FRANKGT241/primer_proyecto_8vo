const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customersController');
const authController = require('../controllers/authController');

// Rutas CRUD

router.post('/customer', customerController.createCustomer);
router.get('/customer', customerController.getAllCustomers);

module.exports = (app) => {
	// Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
	app.use('/web/api', authController.authenticateToken, router);
};

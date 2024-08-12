const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customersController');
const authController = require('../controllers/authController');

// Rutas CRUD

router.post('/customer', customerController.createCustomer);
router.get('/customer', customerController.getAllCustomers);
router.get('/customer/:customer_id', customerController.getCustomerById);
router.put('/customer/:customer_id', customerController.updateCustomer);
router.delete('/customer/:customer_id', customerController.deleteCustomer);

module.exports = (app) => {
	// Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
	app.use('/web/api', authController.authenticateToken, router);
};

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliersController');
const authController = require('../controllers/authController');

// Rutas CRUD

router.post('/supplier', supplierController.createSupplier);
router.get('/supplier', supplierController.getAllSuppliers);
router.put('/supplier/:supplier_id', supplierController.updateSupplier);
router.delete('/supplier/:supplier_id', supplierController.deleteSupplier);
router.get('/supplier/:supplier_id', supplierController.getSupplier);

module.exports = (app) => {
	// Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
	app.use('/web/api', authController.authenticateToken, router);
};

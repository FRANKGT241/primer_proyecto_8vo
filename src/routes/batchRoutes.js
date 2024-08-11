const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authController = require('../controllers/authController');

// Rutas CRUD

router.post('/batch', batchController.createBatch);

module.exports = (app) => {
	// Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
	app.use('/web/api', authController.authenticateToken, router);
};

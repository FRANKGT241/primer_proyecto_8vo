const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authController = require('../controllers/authController');

// Rutas CRUD para ventas
router.post('/sales', salesController.createSale);
router.get('/sales', salesController.getAllSales);
router.get('/salesDetails', salesController.getAllSalesDetails);
router.put('/salesUpdate', salesController.updateSale);


module.exports = (app) => {
    // Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
    app.use('/web/api', authController.authenticateToken, router);
};

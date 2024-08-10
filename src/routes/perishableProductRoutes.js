const express = require('express');
const router = express.Router();
const perishableProductController = require('../controllers/perishableProductsController');
const authController = require('../controllers/authController');

// Rutas CRUD
router.post('/perishableProducts', perishableProductController.createProduct);
router.get('/perishableProducts', perishableProductController.getAllProducts);
router.get('/perishableProducts/:id', perishableProductController.getProductById);
router.put('/perishableProducts/:id', perishableProductController.updateProduct);
router.delete('/perishableProducts/:id', perishableProductController.deleteProduct);

module.exports = (app) => {
    // Todas las rutas bajo la autenticación `/web/api`, protegido por autenticación
    app.use('/web/api', authController.authenticateToken, router);
};

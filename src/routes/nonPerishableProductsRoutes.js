const express = require('express');
const router = express.Router();
const nonPerishableProductController = require('../controllers/nonPerishableProductsController');

// Rutas CRUD
router.post('/nonPerishableProducts', nonPerishableProductController.createProduct);
router.get('/nonPerishableProducts', nonPerishableProductController.getAllProducts);
router.get('/nonPerishableProducts/:id', nonPerishableProductController.getProductById);
router.put('/nonPerishableProducts/:id', nonPerishableProductController.updateProduct);
router.delete('/nonPerishableProducts/:id', nonPerishableProductController.deleteProduct);

module.exports = router;

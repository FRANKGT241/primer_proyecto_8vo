const express = require('express');
const router = express.Router();
const perishableProductController = require('../controllers/perishableProductsController');

// Rutas CRUD
router.post('/perishableProducts', perishableProductController.createProduct);
router.get('/perishableProducts', perishableProductController.getAllProducts);
router.get('/perishableProducts/:id', perishableProductController.getProductById);
router.put('/perishableProducts/:id', perishableProductController.updateProduct);
router.delete('/perishableProducts/:id', perishableProductController.deleteProduct);

module.exports = router;

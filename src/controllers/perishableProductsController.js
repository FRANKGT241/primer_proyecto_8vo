const PerishableProduct = require('../models/perishableProductsModel');

module.exports = {

//Create
  createProduct: async (req, res) => {
    const { product_name, category_id, price, quantity, is_active } = req.body;

    console.log('Request Body:', req.body); 

    if (!product_name || !price || !quantity) {
      return res.status(400).json({ error: 'Product name, price, and quantity are required' });
    }

    try {
      const product = await PerishableProduct.create({
        product_name,
        category_id: category_id || null,
        price,
        quantity,
        is_active: is_active !== undefined ? is_active : true,
      });

      res.status(201).json({ message: 'Product created successfully', productId: product.product_id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating product' });
    }
  },

  //Get de todos los productos
  getAllProducts: async (req, res) => {
    try {
      const products = await PerishableProduct.findAll({
        attributes: ['product_id', 'product_name', 'category_id', 'price', 'quantity', 'is_active'],
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  // Obtener productos por Id
  getProductById: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await PerishableProduct.findByPk(id, {
        attributes: ['product_id', 'product_name', 'category_id', 'price', 'quantity', 'is_active'],
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product' });
    }
  },

  // Actualizar productos
  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { product_name, category_id, price, quantity, is_active } = req.body;

    try {
      const product = await PerishableProduct.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product_name) product.product_name = product_name;
      if (category_id) product.category_id = category_id;
      if (price) product.price = price;
      if (quantity) product.quantity = quantity;
      if (is_active !== undefined) product.is_active = is_active;

      await product.save();

      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      res.status(500).json({ error: 'Error updating product' });
    }
  },

  // Cambiar estado de producto
  deleteProduct: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await PerishableProduct.findByPk(id);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      product.is_active = false;
      await product.save();
  
      res.json({ message: 'Product status updated to inactive' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating product status' });
    }
  },


}

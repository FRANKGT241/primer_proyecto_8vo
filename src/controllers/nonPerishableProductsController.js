const NonPerishableProduct = require('../models/nonPerishableProductsModel');
const InventoryNonPerishable = require('../models/inventory_non_perishable');
const sequelize = require('../database');
module.exports = {
  // Create
  createProduct: async (req, res) =>{
    const { product_name, category_id, price, quantity, supplier_id } = req.body;
  
    console.log('Request Body:', req.body);
  
    if (!product_name || !price || !quantity) {
      return res.status(400).json({ error: 'Product name, price, and quantity are required' });
    }
  
    const t = await sequelize.transaction();
    try {
      // Crear o actualizar el producto no perecedero
      let product = await NonPerishableProduct.findOne({ where: { product_name }, transaction: t });
  
      if (!product) {
        // Crear el producto si no existe
        product = await NonPerishableProduct.create({
          product_name,
          supplier_id: supplier_id || null,
          category_id: category_id || null,
          price,
          quantity,
          is_active: true,
        }, { transaction: t });
      } else {
        // Actualizar la cantidad del producto existente
        await NonPerishableProduct.update(
          { quantity: product.quantity + quantity },
          { where: { product_id: product.product_id }, transaction: t }
        );
      }
  
      // Actualizar el inventario
      const existingInventory = await InventoryNonPerishable.findOne({
        where: { product_id: product.product_id },
        transaction: t
      });
  
      if (existingInventory) {
        // Si ya existe un inventario para el producto, actualizar la cantidad
        await InventoryNonPerishable.update(
          { quantity: existingInventory.quantity + quantity, last_updated: new Date() },
          { where: { inventory_id: existingInventory.inventory_id }, transaction: t }
        );
      } else {
        // Si no existe, crear un nuevo registro de inventario
        await InventoryNonPerishable.create({
          product_id: product.product_id,
          quantity,
          last_updated: new Date(),
          is_active: true,
        }, { transaction: t });
      }
  
      await t.commit();
      res.status(201).json({ message: 'Non-perishable product created or updated successfully', productId: product.product_id });
    } catch (error) {
      await t.rollback();
      console.error('Error creating or updating non-perishable product:', error);
      res.status(500).json({ error: 'Error creating or updating non-perishable product', details: error.message });
    }
  },

  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await NonPerishableProduct.findAll({
        attributes: ['product_id', 'product_name', 'category_id', 'price', 'quantity', 'is_active', 'supplier_id'],
        where: { is_active: true },
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products,' + error });
    }
  },

  // Obtener productos por Id
  getProductById: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await NonPerishableProduct.findByPk(id, {
        attributes: ['product_id', 'product_name', 'category_id', 'price', 'quantity', 'is_active', 'supplier_id'],
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
    const { product_name, category_id, price, quantity, is_active, supplier_id } = req.body;

    try {
      const product = await NonPerishableProduct.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found, ' + error });
      }

      if (product_name) product.product_name = product_name;
      if (category_id) product.category_id = category_id;
      if (price) product.price = price;
      if (quantity) product.quantity = quantity;
      if (is_active !== undefined) product.is_active = is_active;
      if (supplier_id) product.supplier_id = supplier_id;

      await product.save();

      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      res.status(500).json({ error: 'Error updating product, ' + error });
    }
  },

  // Cambiar estado de producto
  deleteProduct: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await NonPerishableProduct.findByPk(id);

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

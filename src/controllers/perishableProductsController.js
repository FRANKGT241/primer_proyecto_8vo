const PerishableProduct = require('../models/perishableProductsModel');
const Batch = require('../models/batchModel');
const InventoryPerishable  = require('../models/inventoryPerishable');
const sequelize = require('../database');

module.exports = {

//Create
createProduct : async (req, res) => {
  const {
    product_name,
    category_id,
    price,
    quantity,
    production_date,
    expiration_date,
    supplier_id
  } = req.body;

  console.log('Request Body:', req.body);

  if (!product_name || !price || !quantity || !production_date || !expiration_date) {
    return res.status(400).json({ error: 'Product name, price, quantity, production date, and expiration date are required' });
  }

  const t = await sequelize.transaction();
  try {
    // Crear o actualizar el producto perecedero
    let product = await PerishableProduct.findOne({ where: { product_name }, transaction: t });

    if (!product) {
      // Crear el producto si no existe
      product = await PerishableProduct.create({
        product_name,
        category_id: category_id || null,
        price,
        supplier_id: supplier_id || null,
        quantity,
        is_active: true,
      }, { transaction: t });
    } else {
      // Actualizar la cantidad del producto existente
      await PerishableProduct.update(
        { quantity: product.quantity + quantity },
        { where: { product_id: product.product_id }, transaction: t }
      );
    }

    // Crear un lote para el producto
    await Batch.create({
      product_id: product.product_id,
      production_date,
      expiration_date,
      quantity,
      is_active: true,
    }, { transaction: t });

    // Actualizar el inventario
    const existingInventory = await InventoryPerishable.findOne({
      where: { product_id: product.product_id },
      transaction: t
    });

    if (existingInventory) {
      // Si ya existe un inventario para el producto, actualizar la cantidad
      await InventoryPerishable.update(
        { quantity: existingInventory.quantity + quantity, last_updated: new Date() },
        { where: { inventory_id: existingInventory.inventory_id }, transaction: t }
      );
    } else {
      // Si no existe, crear un nuevo registro de inventario
      await InventoryPerishable.create({
        product_id: product.product_id,
        quantity,
        last_updated: new Date(),
        is_active: true,
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Perishable product created or updated successfully', productId: product.product_id });
  } catch (error) {
    await t.rollback();
    console.error('Error creating or updating perishable product:', error);
    res.status(500).json({ error: 'Error creating or updating perishable product', details: error.message });
  }
},
  //Get de todos los productos
  getAllProducts: async (req, res) => {
    try {
      const products = await PerishableProduct.findAll({
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
      const inventory = await InventoryPerishable.findOne({
        where: { inventory_id: id },
        attributes: ['inventory_id', 'product_id'],
      });

      const product = await PerishableProduct.findOne({
        where: { product_id: inventory.product_id },
        attributes: ['product_id', 'product_name', 'category_id', 'price', 'quantity', 'is_active', 'supplier_id'],
      });
  

      res.json({product});
      
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product or inventory' });
      console.log(error)
    }
  },

  // Actualizar productos
  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { product_name, category_id, price, quantity, is_active, supplier_id } = req.body;

    try {
      const product = await PerishableProduct.findByPk(id);

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

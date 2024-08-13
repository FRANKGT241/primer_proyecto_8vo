const Sale = require('../models/salesModel');
const SalesDetail = require('../models/salesDetailsModel');
const Inventory = require('../models/inventoryModel');
const sequelize  = require('../database');

module.exports = {
  createSale: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { date, total, user_id, details } = req.body;
      
      // Validar la entrada
      if (!date || !total || !user_id || !details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({ message: 'Datos de entrada inválidos' });
      }

      // Crear la venta
      const sale = await Sale.create({ date, total, user_id }, { transaction: t });

      // Procesar cada detalle de venta
      for (let detail of details) {
        const { inventory_id, quantity, unit_price, product_type } = detail;

        // Validar los detalles de la venta
        if (!inventory_id || !quantity || !unit_price || !product_type) {
          throw new Error('Datos del detalle de venta inválidos');
        }

        // Crear el detalle de la venta
        await SalesDetail.create({
          inventory_id,
          quantity,
          unit_price,
          sale_id: sale.sale_id
        }, { transaction: t });

        // Actualizar la cantidad en inventario
        const inventory = await Inventory.findByPk(inventory_id, { transaction: t });
        if (!inventory) {
          throw new Error(`Inventario con ID ${inventory_id} no encontrado`);
        }

        if (inventory.is_active === 0) {
          throw new Error(`El producto con ID ${inventory_id} está inactivo`);
        }

        if (inventory.quantity < quantity) {
          throw new Error(`No hay suficiente cantidad en inventario para el producto con ID ${inventory_id}`);
        }

        // Descontar la cantidad del inventario
        await Inventory.decrement('quantity', {
          by: quantity,
          where: { inventory_id },
          transaction: t
        });
      }

      // Confirmar la transacción
      await t.commit();
      res.status(201).json(sale);
    } catch (error) {
      // Deshacer la transacción en caso de error
      await t.rollback();
      res.status(500).json({ message: 'Error al crear la venta', error: error.message });
    }
  }
};

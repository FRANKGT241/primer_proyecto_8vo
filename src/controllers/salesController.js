const Sale = require('../models/salesModel');
const SalesDetail = require('../models/salesDetailsModel');
const InventoryPerishable = require('../models/inventoryPerishable');
const InventoryNonPerishable = require('../models/inventoryNonPerishable');
const PerishableProduct = require('../models/perishableProductsModel');
const NonPerishableProduct = require('../models/nonPerishableProductsModel');
const sequelize = require('../database');
const Customer = require('../models/customersModel');
const Batch = require('../models/batchModel')
module.exports = {
  createSale: async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { user_id, details } = req.body;
        if (!user_id || !details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({ message: 'Datos de entrada inválidos' });
        }

        let total = 0;

        // Calcular el total de la venta
        for (let detail of details) {
            const { quantity, unit_price } = detail;
            if (!quantity || !unit_price) {
                throw new Error('Datos del detalle de venta inválidos');
            }
            total += quantity * unit_price;
        }

        // Crear la venta
        const sale = await Sale.create({ date: new Date(), total, user_id }, { transaction: t });

        for (let detail of details) {
            const { inventory_id, quantity, unit_price, product_type, customers_customer_id } = detail;

            if (product_type === 'Perishable') {
                // Buscar el inventario perecedero para obtener el product_id
                const inventory = await InventoryPerishable.findOne({
                    where: { inventory_id: inventory_id },
                    transaction: t
                });

                if (!inventory) {
                    throw new Error('Inventario perecedero no encontrado');
                }

                const product_id = inventory.product_id;
                let remainingQuantity = quantity;

                // Obtener los lotes activos ordenados por fecha de expiración
                const batches = await Batch.findAll({
                    where: { product_id: product_id, is_active: true },
                    order: [['expiration_date', 'ASC']],
                    transaction: t
                });

                for (const batch of batches) {
                    if (remainingQuantity <= 0) break;

                    let batchQuantity = batch.quantity;
                    if (batchQuantity > remainingQuantity) {
                        batchQuantity -= remainingQuantity;
                        remainingQuantity = 0;
                        await batch.update({ quantity: batchQuantity }, { transaction: t });
                    } else {
                        remainingQuantity -= batchQuantity;
                        await batch.update({ quantity: 0 }, { transaction: t });
                    }
                }

                if (remainingQuantity > 0) {
                    throw new Error('No hay suficiente inventario en lotes para el producto perecedero');
                }

                // Actualizar inventario de productos perecederos
                await InventoryPerishable.decrement('quantity', {
                    by: quantity,
                    where: { inventory_id: inventory_id },
                    transaction: t
                });

                // Actualizar cantidad en el producto perecedero
                await PerishableProduct.decrement('quantity', {
                    by: quantity,
                    where: { product_id: product_id },
                    transaction: t
                });

            } else if (product_type === 'Non Perishable') {
                // Buscar el inventario no perecedero para obtener el product_id
                const inventory = await InventoryNonPerishable.findOne({
                    where: { inventory_id: inventory_id },
                    transaction: t
                });

                if (!inventory) {
                    throw new Error('Inventario no perecedero no encontrado');
                }

                const product_id = inventory.product_id;

                // Actualizar inventario de productos no perecederos
                await InventoryNonPerishable.decrement('quantity', {
                    by: quantity,
                    where: { inventory_id: inventory_id },
                    transaction: t
                });

                // Actualizar cantidad en el producto no perecedero
                await NonPerishableProduct.decrement('quantity', {
                    by: quantity,
                    where: { product_id: product_id },
                    transaction: t
                });

            } else {
                throw new Error('Tipo de producto inválido');
            }

            // Crear detalle de venta
            await SalesDetail.create({
                inventory_perishable_id: product_type === 'Perishable' ? inventory_id : null,
                inventory_non_perishable_id: product_type === 'Non Perishable' ? inventory_id : null,
                quantity,
                unit_price,
                sales_sale_id: sale.sale_id,
                customers_customer_id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(sale);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error al crear la venta', error: error.message });
    }
},

updateSale: async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sale_id, details } = req.body;
    if (!sale_id || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: 'Datos de entrada inválidos' });
    }

    // Buscar la venta existente
    const sale = await Sale.findByPk(sale_id);
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // Obtener detalles de venta existentes
    const existingDetails = await SalesDetail.findAll({
      where: { sales_sale_id: sale_id },
      transaction: t
    });

    // Mapear detalles existentes por ID de inventario
    const existingDetailsMap = new Map();
    existingDetails.forEach(detail => {
      if (detail.inventory_perishable_id) {
        existingDetailsMap.set(detail.inventory_perishable_id, detail);
      }
      if (detail.inventory_non_perishable_id) {
        existingDetailsMap.set(detail.inventory_non_perishable_id, detail);
      }
    });

    let total = 0;

    // Actualizar o eliminar detalles de venta existentes
    for (let detail of details) {
      const { inventory_id, quantity, unit_price, product_type, customers_customer_id } = detail;
      let InventoryModel;
      let ProductModel;
      let productId;
      let existingDetail;

      if (product_type === 'Perishable') {
        InventoryModel = InventoryPerishable;
        ProductModel = PerishableProduct;
        productId = inventory_id;  // ID del producto perecedero
        existingDetail = existingDetailsMap.get(productId);

      } else if (product_type === 'Non Perishable') {
        InventoryModel = InventoryNonPerishable;
        productId = inventory_id;  // ID del producto no perecedero
        existingDetail = existingDetailsMap.get(productId);

      } else {
        throw new Error('Tipo de producto inválido');
      }

      let oldQuantity = existingDetail ? existingDetail.quantity : 0;
      let quantityDifference = quantity - oldQuantity;

      // Actualizar inventario
      if (quantityDifference !== 0) {
        if (quantityDifference > 0) {
          await InventoryModel.decrement('quantity', {
            by: quantityDifference,
            where: { inventory_id: productId },
            transaction: t
          });
        } else {
          await InventoryModel.increment('quantity', {
            by: -quantityDifference,
            where: { inventory_id: productId },
            transaction: t
          });
        }

        if (product_type === 'Perishable') {
          await ProductModel.increment('quantity', {
            by: quantityDifference,
            where: { product_id: productId },
            transaction: t
          });
        }
      }

      // Actualizar o insertar el detalle de venta
      if (existingDetail) {
        await existingDetail.update({
          quantity,
          unit_price,
          customers_customer_id
        }, { transaction: t });
      } else {
        await SalesDetail.create({
          inventory_perishable_id: product_type === 'Perishable' ? productId : null,
          inventory_non_perishable_id: product_type === 'Non Perishable' ? productId : null,
          quantity,
          unit_price,
          sales_sale_id: sale_id,
          customers_customer_id
        }, { transaction: t });
      }

      total += quantity * unit_price;
    }
    const updatedInventoryIds = new Set(details.map(detail => detail.inventory_id));
    const obsoleteDetails = existingDetails.filter(detail => !updatedInventoryIds.has(detail.inventory_perishable_id) && !updatedInventoryIds.has(detail.inventory_non_perishable_id));
    for (let obsoleteDetail of obsoleteDetails) {
      if (obsoleteDetail.inventory_perishable_id) {
        await InventoryPerishable.increment('quantity', {
          by: obsoleteDetail.quantity,
          where: { inventory_id: obsoleteDetail.inventory_perishable_id },
          transaction: t
        });
        
      } else if (obsoleteDetail.inventory_non_perishable_id) {
        await InventoryNonPerishable.increment('quantity', {
          by: obsoleteDetail.quantity,
          where: { inventory_id: obsoleteDetail.inventory_non_perishable_id },
          transaction: t
        });
      }
      await obsoleteDetail.update({ is_active: 0 }, { transaction: t });
    }

    // Actualizar la venta con el nuevo total
    await sale.update({ total, user_id: req.body.user_id }, { transaction: t });
    await t.commit();
    res.status(200).json({ message: 'Venta actualizada correctamente' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error al actualizar la venta', error: error.message });
  }
},

  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.findAll();
      res.status(200).json(sales);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las ventas', error: error.message });
    }
  },
  getAllSalesDetails: async (req, res) => {
    try {
      const salesDetails = await SalesDetail.findAll();
      res.status(200).json(salesDetails);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los detalles de ventas', error: error.message });
    }
  },
};

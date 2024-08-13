const Sale = require('../models/salesModel');
const SalesDetail = require('../models/salesDetailsModel');
const InventoryPerishable = require('../models/inventory_perishable');
const InventoryNonPerishable = require('../models/inventory_non_perishable');
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

      const sale = await Sale.findByPk(sale_id);
      if (!sale) {
          return res.status(404).json({ message: 'Venta no encontrada' });
      }

      const existingDetails = await SalesDetail.findAll({
          where: { sales_sale_id: sale_id },
          transaction: t
      });

      const existingDetailsMap = new Map();
      existingDetails.forEach(detail => {
          existingDetailsMap.set(detail.inventory_perishable_id || detail.inventory_non_perishable_id, detail);
      });

      let total = 0;

      for (let detail of details) {
          const { inventory_id, quantity, unit_price, product_type, customers_customer_id } = detail;
          let InventoryModel;
          let ProductModel;

          if (product_type === 'Perishable') {
              InventoryModel = InventoryPerishable;
              ProductModel = PerishableProduct;

              let existingDetail = existingDetailsMap.get(inventory_id);
              let oldQuantity = existingDetail ? existingDetail.quantity : 0;
              let quantityDifference = quantity - oldQuantity;

              if (quantityDifference !== 0) {
                  if (quantityDifference > 0) {
                      await InventoryModel.decrement('quantity', {
                          by: quantityDifference,
                          where: { inventory_id },
                          transaction: t
                      });
                  } else {
                      await InventoryModel.increment('quantity', {
                          by: -quantityDifference,
                          where: { inventory_id },
                          transaction: t
                      });
                  }

                  await ProductModel.increment('sold_quantity', {
                      by: quantityDifference,
                      where: { product_id: inventory_id },
                      transaction: t
                  });
              }

          } else if (product_type === 'Non Perishable') {
              InventoryModel = InventoryNonPerishable;

              let existingDetail = existingDetailsMap.get(inventory_id);
              let oldQuantity = existingDetail ? existingDetail.quantity : 0;
              let quantityDifference = quantity - oldQuantity;

              if (quantityDifference !== 0) {
                  if (quantityDifference > 0) {
                      await InventoryModel.increment('quantity', {
                          by: quantityDifference,
                          where: { inventory_id },
                          transaction: t
                      });
                  } else {
                      await InventoryModel.decrement('quantity', {
                          by: -quantityDifference,
                          where: { inventory_id },
                          transaction: t
                      });
                  }
              }
          } else {
              throw new Error('Tipo de producto inválido');
          }

          await SalesDetail.upsert({
              inventory_perishable_id: product_type === 'Perishable' ? inventory_id : null,
              inventory_non_perishable_id: product_type === 'Non Perishable' ? inventory_id : null,
              quantity,
              unit_price,
              sales_sale_id: sale_id,
              customers_customer_id
          }, { transaction: t });
      }

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
  }
};
/*
Cursl update:curl --location --request PUT 'http://localhost:3001/web/api/salesUpdate' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6IkVtcGxveWVlIiwiaWF0IjoxNzIzNTM2NTM0LCJleHAiOjE3MjM1NDAxMzR9.pw2XG6ObuRdT2NS5B1ebvAX1m8QSRX61KJpZQ_s-kRU' \
--data '{
  "sale_id": 34,
  "user_id": 6,
  "details": [
    {
      "inventory_id": 34,
      "quantity":0,
      "unit_price": 25.00,
      "product_type": "Perishable",
      "customers_customer_id": 6
    }
  ]
}
'

Curl create
curl --location 'http://localhost:3001/web/api/sales' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6IkVtcGxveWVlIiwiaWF0IjoxNzIzNTM2NTM0LCJleHAiOjE3MjM1NDAxMzR9.pw2XG6ObuRdT2NS5B1ebvAX1m8QSRX61KJpZQ_s-kRU' \
--data '{
  "user_id": 6,
  "details": [
    {
      "inventory_id": 34,
      "quantity": 2,
      "unit_price": 111.00,
      "product_type": "Non Perishable",
      "customers_customer_id": 6
    }
  ]
}
'
*/
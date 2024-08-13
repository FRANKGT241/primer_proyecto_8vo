const Sale = require('../models/salesModel');
const SalesDetail = require('../models/salesDetailsModel');

module.exports = {

  // Create a new sale
  createSale: async (req, res) => {
    const { date, total, user_id, customer_id } = req.body;

    if (!date || !total || !user_id || !customer_id) {
      return res.status(400).json({ error: 'Date, total, user_id, and customer_id are required' });
    }

    try {
      const sale = await Sale.create({
        date,
        total,
        user_id,
        customer_id,
        is_active: true,
      });
      res.status(201).json({ message: 'Sale created successfully', sale_id: sale.sale_id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating sale, ' + error });
    }
  },

  // Get all sales
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.findAll({
        attributes: ['sale_id', 'date', 'total', 'user_id', 'customer_id', 'is_active'],
      });
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching sales' });
    }
  },

  // Get sale by ID
  getSaleById: async (req, res) => {
    const { id } = req.params;

    try {
      const sale = await Sale.findByPk(id, {
        attributes: ['sale_id', 'date', 'total', 'user_id', 'customer_id', 'is_active'],
        include: [
          {
            model: SalesDetail,
            as: 'details',
            attributes: ['detail_id', 'product_id', 'quantity', 'unit_price', 'is_active']
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching sale' });
    }
  },

  // Update sale
  updateSale: async (req, res) => {
    const { id } = req.params;
    const { date, total, user_id, customer_id, is_active } = req.body;

    try {
      const sale = await Sale.findByPk(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      if (date) sale.date = date;
      if (total) sale.total = total;
      if (user_id) sale.user_id = user_id;
      if (customer_id) sale.customer_id = customer_id;
      if (is_active !== undefined) sale.is_active = is_active;

      await sale.save();

      res.json({ message: 'Sale updated successfully', sale });
    } catch (error) {
      res.status(500).json({ error: 'Error updating sale' });
    }
  },

  // Delete sale (soft delete)
  deleteSale: async (req, res) => {
    const { id } = req.params;

    try {
      const sale = await Sale.findByPk(id);

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      sale.is_active = false;
      await sale.save();

      res.json({ message: 'Sale status updated to inactive' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating sale status' });
    }
  }
}

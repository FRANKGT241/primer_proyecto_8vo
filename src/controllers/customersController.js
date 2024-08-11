const customer = require('../models/customersModel.js');

module.exports = {

	async createCustomer(req, res) {
		try {
			const customer = await customer.create(req.body);
			res.json(customer);
		} catch (error) {
			res.status(500).json({ error: 'Error creating customer' });
		}
	},

	async getAllCustomers(req, res) {
		try {
			const customers = await customer.findAll({
				attributes: ['customer_id', 'name', 'email', 'phone', 'is_active'],
			});
			res.json(customers);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching customers' });
		}
	}


};

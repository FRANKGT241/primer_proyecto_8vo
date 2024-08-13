const customerModel = require('../models/customersModel.js');

module.exports = {

	async createCustomer(req, res) {
		try {
			const { full_name, email, address, phone } = req.body;
			const customer = await customerModel.create({ full_name, email, address, phone, is_active: 1 });
			res.json(customer);
		} catch (error) {
			res.status(500).json({ error: 'Error creating customer, ' + error });
		}
	},

	async getAllCustomers(req, res) {
		try {
			const customers = await customerModel.findAll({
				attributes: ['customer_id', 'full_name', 'email', 'address', 'phone', 'is_active'],
			});
			res.json(customers);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching customers, ' + error });
		}
	},

	async getCustomerById(req, res) {
		try {
			const customer = await customerModel.findByPk(req.params.customer_id, {
				attributes: ['customer_id', 'name', 'email', 'phone', 'is_active'],
			});
			res.json(customer);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching customer, ', error });
		}
	},

	async updateCustomer(req, res) {
		try {
			await customerModel.update(req.body, {
				where: { customer_id: req.params.customer_id },
			});
			res.json({ message: 'Customer updated' });
		} catch (error) {
			res.status(500).json({ error: 'Error updating customer, ' + error });
		}
	},

	async deleteCustomer(req, res) {
		try {
			await customerModel.update({ is_active: 0 }, {
				where: { customer_id: req.params.customer_id },
			});
			res.json({ message: 'Customer deleted' });
		} catch (error) {
			res.status(500).json({ error: 'Error deleting customer, ' + error });
		}
	},



};

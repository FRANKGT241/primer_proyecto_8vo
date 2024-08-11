const supplierModel = require('../models/suppliersModel');

module.exports = {

	async createSupplier(req, res) {
		try {
			const { name, description, phone } = req.body;
			const supplier = await supplierModel.create({ name, description, is_active: 1, phone });
			res.json(supplier);
		} catch (error) {
			res.status(500).json({ error: 'Error creating supplier' + error });
		}
	},

	async getAllSuppliers(req, res) {
		try {
			const suppliers = await supplierModel.findAll({
				attributes: ['supplier_id', 'name', 'is_active', 'description', 'phone'],
				where: { is_active: 1 },
			});
			res.json(suppliers);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching suppliers, ' + error });
		}
	},

	async updateSupplier(req, res) {
		try {
			const { supplier_id } = req.params;
			const { name, description, phone } = req.body;
			const supplier = await supplierModel.update({ name, description, phone }, { where: { supplier_id } });
			res.json(supplier);
		} catch (error) {
			res.status(500).json({ error: 'Error updating supplier' + error });
		}
	},

	async deleteSupplier(req, res) {
		try {
			const { supplier_id } = req.params;
			const supplier = await supplierModel.update({ is_active: 0 }, { where: { supplier_id } });
			res.json(supplier);
		} catch (error) {
			res.status(500).json({ error: 'Error deleting supplier' + error });
		}
	},

	async getSupplier(req, res) {
		try {
			const { supplier_id } = req.params;
			const supplier = await supplierModel.findOne({
				attributes: ['supplier_id', 'name', 'is_active', 'description', 'phone'],
				where: { supplier_id },
			});
			res.json(supplier);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching supplier' + error });
		}
	},
}

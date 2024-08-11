const supplierModel = require('../models/suppliersModel');

module.exports = {
	
	async createSupplier(req, res) {
		try {
			const { name, description} = req.body;
			const supplier = await supplierModel.create( { name, description, is_active: 1 } );
			res.json(supplier);
		} catch (error) {
			res.status(500).json({ error: 'Error creating supplier' + error });
		}
	},

	async getAllSuppliers(req, res) {
		try {
			const suppliers = await supplierModel.findAll({
				attributes: ['supplier_id', 'name', 'is_active'],
			});
			res.json(suppliers);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching suppliers' });
		}
	},
}

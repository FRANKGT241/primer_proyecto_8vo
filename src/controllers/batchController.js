const batchModel = require('../models/batchModel.js');
const perishableProductsModel = require('../models/perishableProductsModel.js');

module.exports = {

	// Post a new batch
	async createBatch(req, res) {
		try {
			const batch = await batchModel.create(req.body);
			// Add quantity to the product
			const product = await perishableProductsModel.findByPk(req.body.product_id);
			product.quantity += req.body.quantity;
			await product.save();
			res.json(batch);
		} catch (error) {
			res.status(500).json({ error: 'Error creating batch' });
		}
	},


};

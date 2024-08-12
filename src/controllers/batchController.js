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

	// Get all batches with product info
	async getAllBatches(req, res) {
		try {
			const batches = await batchModel.findAll({
				attributes: ['quantity', 'expiration_date', 'production_date', 'batch_id'], // Include the batch quantity
				include: {
					model: perishableProductsModel,
					attributes: ['product_id', 'product_name', 'price', ['quantity', 'global_quantity'], 'category_id'], // Include product quantity as global_quantity
				},
			});
			res.json(batches);
		} catch (error) {
			res.status(500).json({ error: 'Error fetching batches, ' + error });
		}
	},

	async deleteBatch(req, res) {
		const { id } = req.params;
		try {
			const batch = await batchModel.findByPk(id);
			if (!batch) {
				return res.status(404).json({ error: 'Batch not found' });
			}
			// Subtract quantity from the product
			const product = await perishableProductsModel.findByPk(batch.product_id);
			product.quantity -= batch.quantity;
			await product.save();
			await batch.update({ is_active: false });
			res.json({ message: 'Batch deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Error deleting batch' });
		}
	}


};

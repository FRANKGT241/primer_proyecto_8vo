const Category = require('../models/categoryModel');

module.exports = {

	// Get all categories
	async getAllCategories(req, res) {
		try {
			const categories = await Category.findAll({
				attributes: ['category_id', 'category_name', 'is_active'],
			});
			res.json(categories);
		} catch (error) {
			res.status(500).json({ error: 'Error retrieving categories' });
		}
	},


};

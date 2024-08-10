const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Category = sequelize.define('Category', {
	category_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	category_name: {
		type: DataTypes.STRING(50),
		allowNull: false,
		unique: true,
	},
	is_active: {
		type: DataTypes.TINYINT(1),
		allowNull: false,
		defaultValue: 1,
	},
}, {
	tableName: 'categories',
	timestamps: false,
});

module.exports = Category;

const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Supplier = sequelize.define('Supplier', {
	supplier_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	phone: {
		type: DataTypes.STRING,
		allowNull: false,
	},
}, {
	tableName: 'suppliers',
	timestamps: false,
});

module.exports = Supplier;

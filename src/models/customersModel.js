const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Customer = sequelize.define('Customer', {
	customer_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	full_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	address: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	phone: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
}, {
	tableName: 'customers',
	timestamps: false,
});

module.exports = Customer;

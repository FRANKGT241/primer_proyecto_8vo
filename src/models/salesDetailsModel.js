const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Sale = require('./salesModel');

const SalesDetail = sequelize.define('SalesDetail', {
    detail_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sales',
            key: 'sale_id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'non_perishable_products', //pendiente de corregir para saber si es non_perishable_products o perishable_products
            key: 'product_id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'sales_details',
    timestamps: false
});

module.exports = SalesDetail;

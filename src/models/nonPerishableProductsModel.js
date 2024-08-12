const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const nonPerishableProduct = sequelize.define('nonPerishableProduct', {
    product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'category_id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'suppliers',
            key: 'supplier_id'
        }
    }
}, {
    tableName: 'non_perishable_products',
    timestamps: false
});

module.exports = nonPerishableProduct;

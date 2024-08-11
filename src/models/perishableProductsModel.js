const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Batch = require('./batchModel');

const PerishableProduct = sequelize.define('PerishableProduct', {
    product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'category_id',
        },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'perishable_products',
    timestamps: false,
});

PerishableProduct.hasMany(Batch, {
    foreignKey: 'product_id',
});
Batch.belongsTo(PerishableProduct, {
    foreignKey: 'product_id',
});

module.exports = PerishableProduct;

const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Batch = sequelize.define('Batch', {
    batch_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    production_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expiration_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'batches',
    timestamps: false,
});

module.exports = Batch;

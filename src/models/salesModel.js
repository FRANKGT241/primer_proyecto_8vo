const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const SalesDetail = require('./salesDetailsModel');


const Sale = sequelize.define('Sale', {
    sale_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'customer_id' //Customer no se incluye en el diagrama de base de datos
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'sales',
    timestamps: false,
});

Sale.hasMany(SalesDetail, { foreignKey: 'sale_id', as: 'details' });
SalesDetail.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

module.exports = Sale;

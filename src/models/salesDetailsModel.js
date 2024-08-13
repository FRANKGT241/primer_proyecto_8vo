const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SalesDetail = sequelize.define('SalesDetail', {
  detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  },
  sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'sales_details',
  timestamps: false,
});

module.exports = SalesDetail;

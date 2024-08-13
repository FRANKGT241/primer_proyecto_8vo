const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Inventory = sequelize.define('Inventory', {
  inventory_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_type: {
    type: DataTypes.ENUM('Perishable', 'Non Perishable'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  }
}, {
  tableName: 'inventory',
  timestamps: false,
});

module.exports = Inventory;

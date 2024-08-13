// models/inventoryPerishable.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Ajusta la ruta según tu configuración

const InventoryPerishable = sequelize.define('InventoryPerishable', {
  inventory_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'inventory_perishable',
  timestamps: false,
});

module.exports = InventoryPerishable;

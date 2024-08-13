// models/inventoryNonPerishable.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Ajusta la ruta según tu configuración

const InventoryNonPerishable = sequelize.define('InventoryNonPerishable', {
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
  tableName: 'inventory_non_perishable',
  timestamps: false,
});

module.exports = InventoryNonPerishable;

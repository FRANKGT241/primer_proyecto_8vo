const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const SalesDetail = sequelize.define('SalesDetail', {
  detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  inventory_perishable_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_perishable',
      key: 'inventory_id'
    }
  },
  inventory_non_perishable_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_non_perishable',
      key: 'inventory_id'
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
  sales_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'sale_id'
    }
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  customers_customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'customer_id'
    }
  }
}, {
  tableName: 'sales_details',
  timestamps: false
});

module.exports = SalesDetail;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); 

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Administrator', 'Employee'),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1, 
  },
}, {
  tableName: 'users', 
  timestamps: false,  
});

module.exports = User;

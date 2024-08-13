const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); 

const Schedule = sequelize.define('Schedule', {
 schedule_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  work_date: {
    type: DataTypes.DATE,
    allowNull: false, 
  },
  hours_worked: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false, 
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1, 
  },
}, {
  tableName: 'schedules', 
  timestamps: false,  
});

module.exports = Schedule;

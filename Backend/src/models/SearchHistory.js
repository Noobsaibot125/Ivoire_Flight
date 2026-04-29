const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const SearchHistory = sequelize.define('SearchHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('flight', 'hotel', 'assurance'),
    allowNull: false,
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON, // Store search params like from/to, dates, etc.
    allowNull: true,
  },
  resultsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

// Associations
User.hasMany(SearchHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
SearchHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = SearchHistory;

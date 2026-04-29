const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('flight', 'hotel', 'article'),
    allowNull: false,
  },
  itemId: {
    type: DataTypes.STRING, // Store external ID (like Skyscanner flight ID or Hotel ID)
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON, // Store snapshot of data to display easily
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Associations
User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

module.exports = Favorite;

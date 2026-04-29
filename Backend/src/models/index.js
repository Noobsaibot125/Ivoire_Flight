const { sequelize } = require('../config/db');
const User = require('./User');
const Favorite = require('./Favorite');
const Otp = require('./Otp');

// Here we can initialize other models as well when they are created
const SearchHistory = require('./SearchHistory');
// const Notification = require('./Notification');
// const Insurance = require('./Insurance');
// const Article = require('./Article');
// const Document = require('./Document');

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // Use alter: true to update schema without dropping tables
        console.log('Modèles synchronisés avec la base de données.');
    } catch (error) {
        console.error('Erreur de synchronisation des modèles:', error);
    }
};

module.exports = {
    sequelize,
    syncDB,
    User,
    Favorite,
    Otp
};

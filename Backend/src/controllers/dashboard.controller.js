const Favorite = require('../models/Favorite');
const SearchHistory = require('../models/SearchHistory');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch counts
    const favoritesCount = await Favorite.count({ where: { userId } });
    const searchesCount = await SearchHistory.count({ where: { userId } });
    
    // For now, let's assume 'Alertes' are not yet implemented in a model, so we return 0
    const alertsCount = 0;

    // Fetch recent history
    const history = await SearchHistory.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      stats: {
        voyages: searchesCount, // Using searches as a proxy for 'voyages' for now
        favoris: favoritesCount,
        alertes: alertsCount
      },
      history: history.map(item => ({
        id: item.id,
        type: item.type,
        label: item.query,
        date: new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        details: item.details,
        status: 'Recherche', // Placeholder status
      }))
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

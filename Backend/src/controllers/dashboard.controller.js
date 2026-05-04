const Favorite = require('../models/Favorite');
const SearchHistory = require('../models/SearchHistory');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch counts
    const flightFavoritesCount = await Favorite.count({ where: { userId, type: 'flight' } });
    const hotelFavoritesCount = await Favorite.count({ where: { userId, type: 'hotel' } });
    const searchesCount = await SearchHistory.count({ where: { userId } });
    
    // For now, let's assume 'Alertes' are not yet implemented in a model, so we return 0
    const alertsCount = 0;

    // Fetch recent history
    const rawHistory = await SearchHistory.findAll({
      where: { userId },
      limit: 100, // Augmenté pour être sûr de tout voir
      order: [['updatedAt', 'DESC']]
    });

    const flightHistory = rawHistory
      .filter(item => item.type === 'flight' || (!item.type && item.query.includes('→'))) // Fallback: '→' indique souvent un vol
      .map(item => ({
        id: item.id,
        type: 'flight',
        label: item.label || item.query,
        date: new Date(item.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date(item.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        details: item.details,
        status: 'Recherche',
      }));

    const hotelHistory = rawHistory
      .filter(item => item.type === 'hotel' || (!item.type && !item.query.includes('→'))) // Fallback: le reste est supposé être hôtel
      .map(item => ({
        id: item.id,
        type: 'hotel',
        label: item.label || item.query,
        date: new Date(item.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date(item.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        details: item.details,
        status: 'Recherche',
      }));

    return res.status(200).json({
      success: true,
      stats: {
        voyages: flightHistory.length,
        hotels: hotelHistory.length,
        flightFavorites: flightFavoritesCount,
        hotelFavorites: hotelFavoritesCount,
        favoris: flightFavoritesCount + hotelFavoritesCount, // Total pour compatibilité
        alertes: alertsCount,
        totalSearches: searchesCount
      },
      flightHistory,
      hotelHistory,
      history: [...flightHistory, ...hotelHistory]
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, itemId, data } = req.body;

    const existing = await Favorite.findOne({ where: { userId, type, itemId } });
    if (existing) {
      await existing.destroy();
      return res.status(200).json({ success: true, message: 'Retiré des favoris', isFavorite: false });
    } else {
      await Favorite.create({ userId, type, itemId, data });
      return res.status(201).json({ success: true, message: 'Ajouté aux favoris', isFavorite: true });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ 
      success: true, 
      favorites,
      flightFavorites: favorites.filter(f => f.type === 'flight'),
      hotelFavorites: favorites.filter(f => f.type === 'hotel')
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

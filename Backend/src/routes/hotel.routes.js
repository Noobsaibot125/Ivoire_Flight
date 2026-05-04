const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { 
    getNearbyHotels, 
    searchHotels, 
    toggleFavorite, 
    getFavorites, 
    getHistory, 
    deleteHistory 
} = require('../controllers/hotel.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');

const hotelLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de requêtes. Réessayez dans une minute.' },
});

// GET  /api/hotels/nearby?city=Abidjan&checkin=…&checkout=…
router.get('/nearby', hotelLimiter, optionalAuth, getNearbyHotels);

// POST /api/hotels/search  { city, checkin, checkout, adults }
router.post('/search', hotelLimiter, optionalAuth, searchHotels);

// Favoris
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, toggleFavorite);

// Historique
router.get('/history', authMiddleware, getHistory);
router.delete('/history', authMiddleware, deleteHistory);

module.exports = router;

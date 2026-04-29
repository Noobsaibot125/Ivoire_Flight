const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { getAirlines, searchFlights, getAirports, getBookingRedirect } = require('../controllers/flight.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Rate-limit plus strict pour les appels Gemini (coûteux)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de recherches. Veuillez patienter une minute avant de réessayer.',
  },
});

// Rate-limit plus permissif pour autocomplete (appels fréquents et légers)
const autocompleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// GET  /api/flights/airlines  – liste des compagnies (cache 24h côté serveur)
router.get('/airlines', getAirlines);

// GET  /api/flights/airports?q= – autocomplete aéroports (cache 1h côté serveur)
router.get('/airports', autocompleteLimiter, getAirports);

// POST /api/flights/search    – recherche Gemini
router.post('/search', searchLimiter, optionalAuth, searchFlights);

// GET  /api/flights/book?token=… – résout l'URL officielle de la compagnie + redirige
router.get('/book', getBookingRedirect);

module.exports = router;

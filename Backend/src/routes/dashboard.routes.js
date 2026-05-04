const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/data', authMiddleware, dashboardController.getDashboardData);
router.post('/favorite', authMiddleware, dashboardController.toggleFavorite);
router.get('/favorite', authMiddleware, dashboardController.getFavorites);

module.exports = router;

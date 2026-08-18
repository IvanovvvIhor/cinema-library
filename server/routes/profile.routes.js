const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/authMiddleware');

router.get('/achievements', protect, profileController.getAchievements);
router.get('/', protect, profileController.getProfile);
router.put('/', protect, profileController.updateProfile);
router.get('/analytics', protect, profileController.getAnalytics);

module.exports = router;
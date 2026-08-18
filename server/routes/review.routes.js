const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.create);
router.get('/', reviewController.getAll);
router.delete('/:id', protect, reviewController.remove);

module.exports = router;
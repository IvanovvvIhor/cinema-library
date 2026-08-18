const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', listController.getPublic);
router.get('/', protect, listController.getUserLists);
router.get('/:id', listController.getById);
router.post('/', protect, listController.create);
router.post('/:listId/items', protect, listController.addItem);
router.delete('/watchlist/:movieId', protect, listController.removeItem);
router.put('/:id', protect, listController.updatePoster);
router.post('/:id/vote', protect, listController.vote);

module.exports = router;
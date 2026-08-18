const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');

router.get('/trending', movieController.getTrending);
router.get('/proxy', movieController.proxyRequest);
router.get('/:id', movieController.getMovie);

module.exports = router;
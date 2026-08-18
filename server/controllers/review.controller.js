const reviewService = require('../services/review.service');

const create = async (req, res) => {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const reviews = await reviewService.getReviews();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const result = await reviewService.deleteReview(req.user.id, req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Помилка при видаленні рецензії' });
    }
};

module.exports = { create, getAll, remove };
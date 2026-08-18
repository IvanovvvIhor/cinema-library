const movieService = require('../services/movie.service');

const getTrending = async (req, res) => {
    try {
        const data = await movieService.getTrendingMovies(req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB Liaison failed' });
    }
};

const getMovie = async (req, res) => {
    try {
        const data = await movieService.getMovieDetails(req.params.id, req.query.language);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB Liaison Failed' });
    }
};

const proxyRequest = async (req, res) => {
    const token = process.env.VITE_TMDB_READ_ACCESS_TOKEN || process.env.TMDB_TOKEN;
    try {
        const { endpoint, ...params } = req.query;
        if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
        if (!token) return res.status(500).json({ error: 'Server configuration error' });

        const data = await movieService.proxyMovieRequest(endpoint, params, token.trim());
        res.json(data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'TMDB Liaison Failed', 
            details: error.response?.data || error.message 
        });
    }
};

module.exports = { getTrending, getMovie, proxyRequest };
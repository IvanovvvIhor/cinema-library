const axios = require('axios');

const getTrendingMovies = async (page = 1) => {
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
        headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}`, accept: 'application/json' },
        params: { language: 'uk-UA', page }
    });
    return response.data;
};

const getMovieDetails = async (id, language) => {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: { Authorization: `Bearer ${process.env.VITE_TMDB_READ_ACCESS_TOKEN}` },
        params: { language, append_to_response: 'credits,videos' }
    });
    return response.data;
};

const proxyMovieRequest = async (endpoint, params, token) => {
    const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
        headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
        params
    });
    return response.data;
};

module.exports = { getTrendingMovies, getMovieDetails, proxyMovieRequest };
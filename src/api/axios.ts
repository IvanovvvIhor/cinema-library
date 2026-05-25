import axios from 'axios';

const api = axios.create({
    baseURL: 'https://cinema-library.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[AUTH] Token expired or invalid. Clearing token.');
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
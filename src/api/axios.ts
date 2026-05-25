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
            console.warn('[AUTH] Token expired or invalid. Logging out.');
            localStorage.removeItem('token');
            if (window.location.pathname !== '/') {
                window.location.href = '/'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;
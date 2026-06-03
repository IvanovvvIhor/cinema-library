import axios from 'axios';
import { store } from '../store/store'; 
import { logout } from '../store/authSlice'; 

const api = axios.create({
    baseURL: 'https://cinema-library.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[AUTH] Token expired or invalid. Clearing token.');
            localStorage.removeItem('token');
            
            store.dispatch(logout()); 
        }
        return Promise.reject(error);
    }
);

export default api;
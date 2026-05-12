import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://cinema-library.onrender.com',
    withCredentials: true,
});

export default instance;
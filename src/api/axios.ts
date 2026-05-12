import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Базова адреса твого бекенду
    withCredentials: true, // ОБОВ'ЯЗКОВО: щоб браузер передавав куки (токен)
});

export default instance;
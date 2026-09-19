import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

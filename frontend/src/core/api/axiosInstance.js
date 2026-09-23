import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? `http://${window.location.hostname}:5000/api` : '/api',
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

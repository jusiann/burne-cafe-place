import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api.utils.js';
import { STORAGE_KEYS, getItem, removeItem } from '../constants/storage.utils.js';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = getItem(STORAGE_KEYS.TOKEN);
    if (token)
        config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const status = error.response?.status;

        if (status === 401) {
            const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken && !error.config._retry) {
                error.config._retry = true;

                try {
                    const { data } = await axios.post(
                        `${API_BASE_URL}/auth/refresh-token`,
                        { refresh_token: refreshToken },
                    );

                    if (data.access_token) {
                        const { setItem } = await import('../constants/storage.utils.js');
                        setItem(STORAGE_KEYS.TOKEN, data.access_token);
                        setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);

                        error.config.headers.Authorization = `Bearer ${data.access_token}`;
                        return api(error.config);
                    }
                } catch {
                    removeItem(STORAGE_KEYS.TOKEN);
                    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    removeItem(STORAGE_KEYS.USER);
                }
            } else {
                removeItem(STORAGE_KEYS.TOKEN);
                removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                removeItem(STORAGE_KEYS.USER);
            }
        }

        // Vercel serverless hatalarındaki { error: { code, message } } nesnesini string'e çevir.
        if (error.response?.data?.error && typeof error.response.data.error === 'object') {
            error.response.data.error = error.response.data.error.message || JSON.stringify(error.response.data.error);
        }

        return Promise.reject(error);
    },
);

export default api;

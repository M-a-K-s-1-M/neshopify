/* eslint-disable no-useless-catch */
import axios from "axios";
import { env } from "../config/env";
import { AuthService } from "../api/apiAuth";

const $api = axios.create({
    baseURL: env.api.url,
    withCredentials: true,

})

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;

    if (originalRequest.status === 401 && error.config && !error.config_isRetry) {
        originalRequest._isRetry = true;

        try {
            const res = await AuthService.checkAuth();
            localStorage.setItem("accessToken", res.accessToken);

        } catch (e) {
            throw e;
        }
    }
    throw error;
})

export { $api };
/* eslint-disable no-useless-catch */
import axios from "axios";
import { env } from "../config/env";

const $api = axios.create({
    baseURL: env.api.url,
    params: {},
    withCredentials: true,
})


$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            originalRequest._retry = true;
            try {
                // refreshToken отправляется автоматически через HttpOnly cookie
                await $api.post("/auth/refresh");
                return $api.request(originalRequest); // повторяем исходный запрос
            } catch {
                // если refresh не удался — можно, например, редирект на логин
                window.location.href = "/auth";
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);


export { $api };
/* eslint-disable no-useless-catch */
import axios from "axios";

const ENV_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
const FALLBACK_DEV_BASE_URL = "http://localhost:5000/api";

const baseURL = ENV_BASE_URL
    ? ENV_BASE_URL
    : process.env.NODE_ENV === "development"
        ? FALLBACK_DEV_BASE_URL
        : "";

const $api = axios.create({
    baseURL,
    params: {},
    withCredentials: true,
})


$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const skipAuthRedirect = Boolean(
            originalRequest?.headers?.["x-skip-auth-redirect"]
        );

        if (skipAuthRedirect) {
            return Promise.reject(error);
        }

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
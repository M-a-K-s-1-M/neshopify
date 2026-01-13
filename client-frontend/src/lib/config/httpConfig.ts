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
    timeout: 15000,
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
                const returnTo = `${window.location.pathname}${window.location.search}`;
                const params = new URLSearchParams();
                if (returnTo) params.set('returnTo', returnTo);

                const match = window.location.pathname.match(/^\/preview\/sites\/([^/]+)(?:\/|$)/);
                if (match?.[1]) {
                    const siteId = match[1];
                    const url = params.toString()
                        ? `/preview/sites/${siteId}/auth?${params.toString()}`
                        : `/preview/sites/${siteId}/auth`;
                    window.location.href = url;
                    return Promise.reject(error);
                }

                // Published storefront: /{siteId(uuid)}/{siteSlug}/...
                const publishedMatch = window.location.pathname.match(
                    /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([^/]+)(?:\/|$)/i
                );
                if (publishedMatch?.[1] && publishedMatch?.[2]) {
                    const [, siteId, siteSlug] = publishedMatch;
                    const basePath = `/${siteId}/${siteSlug}`;
                    const url = params.toString()
                        ? `${basePath}/auth?${params.toString()}`
                        : `${basePath}/auth`;
                    window.location.href = url;
                    return Promise.reject(error);
                }

                const url = params.toString() ? `/auth?${params.toString()}` : '/auth';
                window.location.href = url;
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);


export { $api };
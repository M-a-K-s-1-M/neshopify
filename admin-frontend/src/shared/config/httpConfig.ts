import axios from "axios";
import { env } from "../config/env";

const $api = axios.create({
    baseURL: env.api.url,

})

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
})

export { $api };
import type { IAuthResponse } from "../models";
import { $api } from "../config";

export class AuthService {
    static async login(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/login", { email, password });
        return res.data; // accessToken доступен через cookie на клиенте, возвращать для state можно при желании
    }

    static async registration(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/register", { email, password });
        return res.data;
    }

    static async logout(): Promise<void> {
        await $api.post("/auth/logout");
    }

    static async refresh(): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/refresh"); // refreshToken через HttpOnly cookie
        return res.data;
    }
}
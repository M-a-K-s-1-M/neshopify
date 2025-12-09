import type { IAuthResponse } from "@/lib";
import { $api } from "@/lib/config/httpConfig";

export class AuthService {
    static async login(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/login", { email, password });
        return res.data;
    }

    static async registration(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/register", { email, password });
        return res.data;
    }

    static async logout(): Promise<void> {
        await $api.post("/auth/logout");
    }

    static async refresh(): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/refresh");
        return res.data;
    }
}
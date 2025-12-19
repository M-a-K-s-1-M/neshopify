import type { IAuthResponse, JwtPayloadDto } from "@/lib";
import { $api } from "@/lib/config/httpConfig";

export class AuthService {
    static async login(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/login", { email, password });
        return res.data;
    }

    static async loginCustomer(siteId: string, email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>(`/auth/login-customer/${siteId}`, { email, password });
        return res.data;
    }

    static async registration(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/register", { email, password });
        return res.data;
    }

    static async registrationCustomer(siteId: string, email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>(`/auth/register-customer/${siteId}`, { email, password });
        return res.data;
    }

    static async logout(): Promise<void> {
        await $api.post("/auth/logout");
    }

    static async refresh(): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>("/auth/refresh");
        return res.data;
    }

    static async updateMe(payload: { email?: string; password?: string }): Promise<IAuthResponse> {
        const res = await $api.patch<IAuthResponse>("/auth/me", payload);
        return res.data;
    }

    static async me(): Promise<JwtPayloadDto> {
        const res = await $api.get<JwtPayloadDto>("/auth/me", {
            headers: {
                "x-skip-auth-redirect": "true",
            },
        });
        return res.data;
    }
}
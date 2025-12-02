/* eslint-disable no-useless-catch */
import type { IAuthResponse } from "../models";
import { $api, env } from "../config";
import type { IUser } from "@/entities";
import axios from "axios";

export class AuthService {

    static async login(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>('/auth/login-admin', { email, password });
        return res.data;
    }

    static async registration(email: string, password: string): Promise<IAuthResponse> {
        const res = await $api.post<IAuthResponse>('/auth/registration', { email, password });
        return res.data;
    }

    static async logout(): Promise<void> {
        return await $api.post('/auth/logout');
    }

    static async checkAuth(): Promise<IAuthResponse> {
        const res = await axios.get<IAuthResponse>(`${env.apiUrl}/auth/refresh`,
            { withCredentials: true }
        )

        return res.data;
    }
}
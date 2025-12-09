'use client'

import { AuthService } from "@/lib/api/apiAuth";
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    siteId?: string;
    exp: number;
    iat: number;
}

interface AuthState {
    user: JwtPayload | null;
    isAuth: boolean;
    isLoading: boolean;
    error: unknown | null;

    setUser: (user: JwtPayload | null) => void;
    login: (email: string, password: string) => Promise<JwtPayload>;
    register: (email: string, password: string) => Promise<JwtPayload>;
    logout: () => Promise<void>;
    refresh: () => Promise<JwtPayload | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuth: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuth: Boolean(user) }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await AuthService.login(email, password);
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            set({ user: payload, isAuth: true });
            return payload;
        } catch (error) {
            set({ error, user: null, isAuth: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await AuthService.registration(email, password);
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            set({ user: payload, isAuth: true });
            return payload;
        } catch (error) {
            set({ error, user: null, isAuth: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.logout();
            set({ user: null, isAuth: false });
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    refresh: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await AuthService.refresh();
            const payload = jwtDecode<JwtPayload>(res.accessToken);
            set({ user: payload, isAuth: true });
            return payload;
        } catch (error) {
            set({ user: null, isAuth: false, error });
            return null;
        } finally {
            set({ isLoading: false });
        }
    }
}));

/* eslint-disable no-useless-catch */
import type { IUser } from '@/entities';
import { $api, type IAuthResponse } from '@/shared';
import { AuthService } from '@/shared/api/apiAuth';
import { create } from 'zustand';

interface IAuthStore {
    user: IUser,
    isAuth: boolean,

    setAuth: (isAuth: boolean) => void,

    setUser: (user: IUser) => void,

    login: (email: string, password: string) => Promise<IUser>,

    logout: () => Promise<void>,

    checkAuth: () => Promise<IUser>,

}

export const useAuth = create<IAuthStore>((set) => ({
    user: {} as IUser,
    isAuth: false,

    setAuth: (isAuth: boolean) => set({ isAuth }),

    setUser: (user: IUser) => set({ user, isAuth: true }),

    login: async (email: string, password: string) => {
        try {
            const res = await AuthService.login(email, password);

            localStorage.setItem('accessToken', res.accessToken);

            set({ user: res.user, isAuth: true });

            return res.user;

        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        localStorage.removeItem("accessToken");
        return await AuthService.logout();
    },

    checkAuth: async () => {
        try {
            const res = await AuthService.checkAuth();

            localStorage.setItem("accessToken", res.accessToken);

            set({ user: res.user, isAuth: true });

            return res.user;

        } catch (error) {
            throw error;
        }
    }

}))
import { AuthService } from "@/shared/api/apiAuth";
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    siteId?: string;
    exp: number;
    iat: number;
}
interface IAuthStore {
    user: JwtPayload | null;
    isAuth: boolean;
    isLoading: boolean;
    error: unknown | null;

    setUser: (user: JwtPayload) => void;
    setAuth: (isAuth: boolean) => void;

    login: (email: string, password: string) => Promise<JwtPayload>;
    logout: () => Promise<void>;
    refresh: () => Promise<JwtPayload | null>;
}

export const useAuth = create<IAuthStore>((set) => ({
    user: null,
    isAuth: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuth: true }),
    setAuth: (isAuth) => set({ isAuth }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await AuthService.login(email, password);

            const payload: JwtPayload = jwtDecode(res.accessToken)

            set({ user: payload, isAuth: true });

            return payload;
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.logout();
            set({ isAuth: false, user: null });
        } catch (error) {
            set({ error });
        } finally {
            set({ isLoading: false });
        }
    },

    refresh: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await AuthService.refresh();

            const payload: JwtPayload = jwtDecode(res.accessToken)

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
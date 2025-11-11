import { create } from "zustand"
import type { IUserFilters } from "../userTypes"

interface IUserStore {
    filters?: IUserFilters,
    setFilters: (filters: IUserFilters) => void,
    setPage: (page: number) => void,
    setLimit: (limit: number) => void,
}

export const useUserStore = create<IUserStore>((set) => ({
    filters: { limit: 11, page: 1 },
    setFilters: (filters) => set({ filters }),
    setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),
    setLimit: (limit) => set((state) => ({ filters: { ...state.filters, limit } })),
}));
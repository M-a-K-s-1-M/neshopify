import { create } from "zustand"
import type { IUserFilters } from "../model/userTypes"

interface IUserStore {
    filters?: IUserFilters,
    setFilters: (filters: IUserFilters) => void,
}

export const useUserStore = create<IUserStore>((set) => ({
    filters: { limit: 6, page: 1 },
    setFilters: (filters: IUserFilters) => set({ filters }),
}));
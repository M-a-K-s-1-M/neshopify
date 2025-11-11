import { create } from 'zustand';

interface IUsersTableStore {
    page: number;
    limit: number;
    selectedIds: string[];
    search: string;

    setPage: (page: number) => void;
    setLimit: (limit: number) => void;

    setSelectedIds: (ids: string[]) => void;
    setSelectedId: (id: string) => void;

    setSearch: (search: string) => void;

    getCurrentSlice?: <T>(items: T[]) => T[];
    getPageCount?: (total: number) => number;
}

export const useUsersTable = create<IUsersTableStore>((set) => ({
    page: 1,
    limit: 5,
    selectedIds: [],
    search: '',

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit }),

    setSelectedIds: (ids) => set({ selectedIds: ids }),
    setSelectedId: (id) =>
        set((state) => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter(selectedId => selectedId !== id)
                : [...state.selectedIds, id]
        })),
    clearSelectedIds: () => set({ selectedIds: [] }),

    setSearch: (search) => set({ search }),

}));
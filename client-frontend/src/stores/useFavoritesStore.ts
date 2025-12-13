'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
    favoritesBySiteId: Record<string, string[]>;

    isFavorite: (siteId: string, productId: string) => boolean;
    toggleFavorite: (siteId: string, productId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favoritesBySiteId: {},

            isFavorite: (siteId, productId) => {
                const list = get().favoritesBySiteId[siteId] ?? [];
                return list.includes(productId);
            },

            toggleFavorite: (siteId, productId) => {
                set((state) => {
                    const current = state.favoritesBySiteId[siteId] ?? [];
                    const next = current.includes(productId)
                        ? current.filter((id) => id !== productId)
                        : [...current, productId];

                    return {
                        favoritesBySiteId: {
                            ...state.favoritesBySiteId,
                            [siteId]: next,
                        },
                    };
                });
            },
        }),
        {
            name: 'neshopify.favorites',
            version: 1,
        },
    ),
);

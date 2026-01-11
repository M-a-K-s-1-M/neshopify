'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EMPTY_FAVORITES: string[] = [];

function favoritesKey(siteId: string, userId?: string | null) {
    return `${siteId}::${userId ?? 'anon'}`;
}

interface FavoritesState {
    favoritesByKey: Record<string, string[]>;

    getFavorites: (siteId: string, userId?: string | null) => string[];
    isFavorite: (siteId: string, productId: string, userId?: string | null) => boolean;
    toggleFavorite: (siteId: string, productId: string, userId?: string | null) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favoritesByKey: {},

            getFavorites: (siteId, userId) => {
                const key = favoritesKey(siteId, userId);
                return get().favoritesByKey[key] ?? EMPTY_FAVORITES;
            },

            isFavorite: (siteId, productId, userId) => {
                const list = get().getFavorites(siteId, userId);
                return list.includes(productId);
            },

            toggleFavorite: (siteId, productId, userId) => {
                set((state) => {
                    const key = favoritesKey(siteId, userId);
                    const current = state.favoritesByKey[key] ?? EMPTY_FAVORITES;
                    const next = current.includes(productId)
                        ? current.filter((id) => id !== productId)
                        : [...current, productId];

                    return {
                        favoritesByKey: {
                            ...state.favoritesByKey,
                            [key]: next,
                        },
                    };
                });
            },
        }),
        {
            name: 'neshopify.favorites',
            version: 2,
            migrate: (persisted: any, version) => {
                // v1 хранил избранное только по siteId => оно «протекало» между аккаунтами.
                // Чтобы гарантировать приватность, начинаем с чистого состояния.
                if (version === 0 || version === 1) {
                    return { favoritesByKey: {} };
                }
                return persisted;
            },
        },
    ),
);

'use client'

import { createContext, useContext, useMemo, useState } from 'react';

export interface CatalogFiltersState {
    search?: string;
    categoryIds?: string[];
    priceMin?: number;
    priceMax?: number;
}

interface CatalogFiltersContextValue {
    filters: CatalogFiltersState;
    setFilters: (next: CatalogFiltersState) => void;
    registerFiltersUi: () => () => void;
    hasFiltersUi: boolean;
}

const CatalogFiltersContext = createContext<CatalogFiltersContextValue | null>(null);

export function CatalogFiltersProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<CatalogFiltersState>({});
    const [filtersUiCount, setFiltersUiCount] = useState(0);

    const registerFiltersUi = () => {
        setFiltersUiCount((current) => current + 1);
        return () => setFiltersUiCount((current) => Math.max(0, current - 1));
    };

    const value = useMemo<CatalogFiltersContextValue>(
        () => ({
            filters,
            setFilters,
            registerFiltersUi,
            hasFiltersUi: filtersUiCount > 0,
        }),
        [filters, filtersUiCount],
    );

    return <CatalogFiltersContext.Provider value={value}>{children}</CatalogFiltersContext.Provider>;
}

export function useCatalogFiltersOptional() {
    return useContext(CatalogFiltersContext);
}

'use client'

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProductCardOne } from "@/components/shudcn-ui/product-cards";

const EMPTY_FAVORITES: string[] = [];

export function ProfileFavoritesShowcaseBlock({
    block,
    siteId,
}: {
    block: BlockInstanceDto;
    siteId: string;
}) {
    void block;
    const title = "Избранные товары";

    const user = useAuthStore((s) => s.user);
    const customerUserId = useMemo(() => {
        if (!user) return null;
        const roles: string[] = Array.isArray((user as any).roles) ? (user as any).roles : [];
        if (!roles.includes('CUSTOMER')) return null;
        if ((user as any).siteId !== siteId) return null;
        return typeof (user as any).sub === 'string' ? (user as any).sub : null;
    }, [siteId, user]);

    const favoriteIds = useFavoritesStore((state) => state.getFavorites(siteId, customerUserId) ?? EMPTY_FAVORITES);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const favoriteKey = useMemo(() => favoriteIds.slice().sort().join(','), [favoriteIds]);
    const [items, setItems] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!favoriteIds.length) {
            setItems([]);
            return;
        }

        let cancelled = false;
        setLoading(true);

        Promise.all(favoriteIds.map((id) => ProductsApi.get(siteId, id)))
            .then((products) => {
                if (!cancelled) setItems(products);
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, favoriteKey, favoriteIds.length]);

    return (
        <section className="space-y-4 bg-transparent">
            <h2 className="text-2xl font-semibold">{title}</h2>

            {loading ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {Array.from({ length: 2 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Избранных товаров пока нет. Добавьте товары из каталога.
                </p>
            ) : (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {items.map((item) => (
                        <ProductCardOne
                            key={item.id}
                            product={item}
                            isFavorited
                            onToggleFavorite={() => toggleFavorite(siteId, item.id, customerUserId)}
                            className="max-w-none"
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

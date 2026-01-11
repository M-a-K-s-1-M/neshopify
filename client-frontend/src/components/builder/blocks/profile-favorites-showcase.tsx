'use client'

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useAuthStore } from "@/stores/useAuthStore";

const EMPTY_FAVORITES: string[] = [];

export function ProfileFavoritesShowcaseBlock({
    block,
    siteId,
}: {
    block: BlockInstanceDto;
    siteId: string;
}) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const subtitle = typeof data.subtitle === "string" ? data.subtitle : undefined;

    const user = useAuthStore((s) => s.user);
    const customerUserId = useMemo(() => {
        if (!user) return null;
        const roles: string[] = Array.isArray((user as any).roles) ? (user as any).roles : [];
        if (!roles.includes('CUSTOMER')) return null;
        if ((user as any).siteId !== siteId) return null;
        return typeof (user as any).sub === 'string' ? (user as any).sub : null;
    }, [siteId, user]);

    const favoriteIds = useFavoritesStore((state) => state.getFavorites(siteId, customerUserId) ?? EMPTY_FAVORITES);
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
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <Card className="bg-transparent p-6 text-sm text-muted-foreground">
                    Избранных товаров пока нет. Добавьте товары из каталога.
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item, index) => (
                        <Card key={`${item.id}-${index}`} className="border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-base">{item.title ?? "Товар"}</CardTitle>
                                <CardDescription className="flex items-center justify-between text-sm">
                                    <span>
                                        {Number(item.price).toLocaleString("ru-RU")} {item.currency}
                                    </span>
                                    <span className="text-xs uppercase text-muted-foreground">
                                        {item.stockStatus === "OUT_OF_STOCK"
                                            ? "Нет в наличии"
                                            : item.stockStatus === "PREORDER"
                                                ? "Предзаказ"
                                                : "В наличии"}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}

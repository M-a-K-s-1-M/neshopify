'use client'

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlockInstanceDto } from "@/lib/types";

interface FavoriteItem {
    name?: string;
    price?: number;
    currency?: string;
    status?: string;
}

export function ProfileFavoritesShowcaseBlock({ block }: { block: BlockInstanceDto }) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const subtitle = typeof data.subtitle === "string" ? data.subtitle : undefined;
    const items = Array.isArray(data.items) ? (data.items as FavoriteItem[]) : [];

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
            </div>

            {items.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">
                    Избранных товаров пока нет. Добавьте товары из каталога.
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item, index) => (
                        <Card key={`${item.name ?? "favorite"}-${index}`} className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">{item.name ?? "Товар"}</CardTitle>
                                <CardDescription className="flex items-center justify-between text-sm">
                                    <span>
                                        {typeof item.price === "number"
                                            ? `${item.price.toLocaleString("ru-RU")} ${item.currency ?? "RUB"}`
                                            : "—"}
                                    </span>
                                    <span className="text-xs uppercase text-muted-foreground">
                                        {item.status ?? "В наличии"}
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

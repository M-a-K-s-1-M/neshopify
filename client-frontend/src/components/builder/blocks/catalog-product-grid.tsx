'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { BlockInstanceDto, PaginatedResponse, ProductDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";

interface CatalogProductGridProps {
    block: BlockInstanceDto;
    siteId: string;
}

interface GridState {
    items: ProductDto[];
    meta: PaginatedResponse<ProductDto>["meta"];
}

export function CatalogProductGridBlock({ block, siteId }: CatalogProductGridProps) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : "Каталог";
    const description = typeof data.description === "string" ? data.description : undefined;
    const emptyState = data.emptyState as { title?: string; description?: string } | undefined;
    const pageSize = typeof data.pageSize === "number" ? data.pageSize : 12;
    const [grid, setGrid] = useState<GridState>({
        items: [],
        meta: { total: 0, page: 1, limit: pageSize },
    });
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = (page = 1, searchTerm = "") => {
        setLoading(true);
        setError(null);
        ProductsApi.list(siteId, { page, limit: pageSize, search: searchTerm || undefined })
            .then((response) => {
                setGrid({ items: response.data, meta: response.meta });
            })
            .catch(() => setError("Не удалось загрузить товары"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProducts(1, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, pageSize]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSearch(searchInput);
        loadProducts(1, searchInput);
    };

    const handlePageChange = (direction: "next" | "prev") => {
        const nextPage = direction === "next" ? grid.meta.page + 1 : grid.meta.page - 1;
        if (nextPage < 1) return;
        const maxPage = Math.ceil((grid.meta.total || 0) / grid.meta.limit);
        if (nextPage > maxPage) return;
        loadProducts(nextPage, search);
    };

    const maxPage = Math.max(1, Math.ceil((grid.meta.total || 0) / grid.meta.limit));

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                <Input
                    placeholder="Поиск по каталогу"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="max-w-md"
                />
                <Button type="submit">Искать</Button>
            </form>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: pageSize }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : grid.items.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {grid.items.map((product) => (
                        <Card key={product.id} className="flex h-full flex-col overflow-hidden">
                            {product.media?.[0]?.url && (
                                <div className="relative h-40 w-full">
                                    <Image
                                        src={product.media[0].url}
                                        alt={product.media[0].alt ?? product.title}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-1 text-base">{product.title}</CardTitle>
                                <CardDescription>
                                    {Number(product.price).toLocaleString("ru-RU")} {product.currency}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <Button variant="secondary" size="sm" className="w-full" type="button">
                                    Подробнее
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                    {emptyState?.description ?? "Товары ещё не добавлены"}
                </Card>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Страница {grid.meta.page} из {maxPage}
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => handlePageChange("prev")}
                        disabled={grid.meta.page <= 1 || loading}>
                        Назад
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => handlePageChange("next")}
                        disabled={grid.meta.page >= maxPage || loading}>
                        Далее
                    </Button>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
        </section>
    );
}

'use client'

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { BlockInstanceDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { resolveMediaUrl } from "@/lib/utils/media";
import { useCatalogFiltersOptional } from "../catalog-filters-context";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface CatalogProductGridProps {
    block: BlockInstanceDto;
    siteId: string;
}

export function CatalogProductGridBlock({ block, siteId }: CatalogProductGridProps) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : "Каталог";
    const description = typeof data.description === "string" ? data.description : undefined;
    const emptyState = data.emptyState as { title?: string; description?: string } | undefined;
    const pageSize = typeof data.pageSize === "number" ? data.pageSize : 12;
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const catalogFilters = useCatalogFiltersOptional();
    const hasFiltersUi = Boolean(catalogFilters?.hasFiltersUi);

    const activeSearch = hasFiltersUi ? catalogFilters?.filters.search || undefined : search || undefined;
    const activeCategoryIds = hasFiltersUi ? catalogFilters?.filters.categoryIds ?? [] : [];
    const activePriceMin = hasFiltersUi ? catalogFilters?.filters.priceMin : undefined;
    const activePriceMax = hasFiltersUi ? catalogFilters?.filters.priceMax : undefined;

    const filtersKey = useMemo(
        () => ({
            search: activeSearch ?? null,
            categoryIds: activeCategoryIds.length ? [...activeCategoryIds].sort().join(',') : null,
            priceMin: activePriceMin ?? null,
            priceMax: activePriceMax ?? null,
        }),
        [activeSearch, activeCategoryIds, activePriceMin, activePriceMax],
    );

    useEffect(() => {
        // При изменении фильтров всегда возвращаемся на первую страницу.
        if (!hasFiltersUi) return;
        setPage(1);
    }, [hasFiltersUi, filtersKey]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSearch(searchInput.trim());
        setPage(1);
    };

    const {
        data: productsPage,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: [
            ...queryKeys.siteProducts(siteId),
            "list",
            { page, limit: pageSize, ...filtersKey },
        ],
        queryFn: () =>
            ProductsApi.list(siteId, {
                page,
                limit: pageSize,
                search: activeSearch,
                categoryIds: activeCategoryIds,
                priceMin: activePriceMin,
                priceMax: activePriceMax,
            }),
        placeholderData: keepPreviousData,
    });

    const gridItems = productsPage?.data ?? [];
    const meta = productsPage?.meta ?? { total: 0, page, limit: pageSize };
    const isBusy = isFetching && !!productsPage;

    const handlePageChange = (direction: "next" | "prev") => {
        setPage((current) => {
            const maxPage = Math.max(1, Math.ceil((meta.total || 0) / meta.limit));
            const nextPage = direction === "next" ? current + 1 : current - 1;
            if (nextPage < 1 || nextPage > maxPage) {
                return current;
            }
            return nextPage;
        });
    };
    const maxPage = Math.max(1, Math.ceil((meta.total || 0) / meta.limit));
    const queryError = error ? "Не удалось загрузить товары" : null;

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            {!hasFiltersUi ? (
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                    <Input
                        placeholder="Поиск по каталогу"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        className="max-w-md"
                    />
                    <Button type="submit">Искать</Button>
                </form>
            ) : null}

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: pageSize }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : gridItems.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gridItems.map((product) => (
                        <Card key={product.id} className="flex h-full flex-col overflow-hidden">
                            {product.media?.length ? (
                                product.media.length > 1 ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                                        <Carousel className="h-full w-full" opts={{ loop: true }}>
                                            <CarouselContent className="ml-0 h-40">
                                                {product.media
                                                    .slice()
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((item) => (
                                                        <CarouselItem key={item.id} className="basis-full pl-0">
                                                            <div className="relative h-40 w-full">
                                                                <Image
                                                                    src={resolveMediaUrl(item.url)}
                                                                    alt={item.alt ?? product.title}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="left-2" />
                                            <CarouselNext className="right-2" />
                                        </Carousel>
                                    </div>
                                ) : (
                                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                                        <Image
                                            src={resolveMediaUrl(product.media[0].url)}
                                            alt={product.media[0].alt ?? product.title}
                                            fill
                                            unoptimized
                                            className="object-contain"
                                        />
                                    </div>
                                )
                            ) : null}
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
                    Страница {meta.page} из {maxPage}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handlePageChange("prev")}
                        disabled={meta.page <= 1 || isBusy}
                    >
                        Назад
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => handlePageChange("next")}
                        disabled={meta.page >= maxPage || isBusy}
                    >
                        Далее
                    </Button>
                </div>
            </div>

            {queryError && <p className="text-sm text-destructive">{queryError}</p>}
        </section>
    );
}

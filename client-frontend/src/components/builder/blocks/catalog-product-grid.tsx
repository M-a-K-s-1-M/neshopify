'use client'

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media";
import { getOrCreateCartSessionId } from "@/lib/utils/cart-session";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
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

const EMPTY_FAVORITES: string[] = [];

export function CatalogProductGridBlock({ block, siteId }: CatalogProductGridProps) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : "Каталог";
    const description = typeof data.description === "string" ? data.description : undefined;
    const emptyState = data.emptyState as { title?: string; description?: string } | undefined;
    const pageSize = typeof data.pageSize === "number" ? data.pageSize : 12;
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [quantityByProductId, setQuantityByProductId] = useState<Record<string, number>>({});
    const [pendingCartProductId, setPendingCartProductId] = useState<string | null>(null);
    const [addedToCartIds, setAddedToCartIds] = useState<string[]>([]);

    const favoriteIds = useFavoritesStore((state) => state.favoritesBySiteId[siteId] ?? EMPTY_FAVORITES);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

    const queryClient = useQueryClient();

    const sessionId = useMemo(() => getOrCreateCartSessionId(), []);
    const { data: cart } = useQuery({
        queryKey: queryKeys.siteCart(siteId, sessionId),
        queryFn: () => CartApi.getCart(siteId, sessionId),
    });

    const cartItemIdByProductId = useMemo(() => {
        const map = new Map<string, string>();
        cart?.items?.forEach((item) => {
            map.set(item.productId, item.id);
        });
        return map;
    }, [cart]);

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

    const addToCartMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            return CartApi.addItem(siteId, payload);
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId: string) => {
            const itemId = cartItemIdByProductId.get(productId);
            if (!itemId) {
                // Если по какой-то причине itemId не найден — просто рефетчим корзину.
                return CartApi.getCart(siteId, sessionId);
            }
            return CartApi.removeItem(siteId, itemId, sessionId);
        },
    });

    const getMaxQty = (product: ProductDto) => {
        if (product.stockStatus === "OUT_OF_STOCK") return 0;
        if (product.stockStatus === "PREORDER") return 99;
        return Math.max(0, Number(product.stock) || 0);
    };

    const getQty = (product: ProductDto) => {
        const max = getMaxQty(product);
        if (max === 0) return 1;

        const current = quantityByProductId[product.id];
        if (typeof current === "number" && Number.isFinite(current)) {
            return Math.min(Math.max(1, current), max);
        }
        return 1;
    };

    const setQty = (product: ProductDto, next: number) => {
        const max = getMaxQty(product);
        const clamped = max === 0 ? 1 : Math.min(Math.max(1, next), max);
        setQuantityByProductId((prev) => ({ ...prev, [product.id]: clamped }));
    };

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

                            <CardHeader className="space-y-2">
                                <CardTitle className="line-clamp-2 text-base leading-snug">{product.title}</CardTitle>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {product.description?.trim() ? product.description : "Описание отсутствует"}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-base font-semibold">
                                        {Number(product.price).toLocaleString("ru-RU")} {product.currency}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-xs",
                                            product.stockStatus === "OUT_OF_STOCK" ? "text-destructive" : "text-muted-foreground",
                                        )}
                                    >
                                        {product.stockStatus === "OUT_OF_STOCK"
                                            ? "Нет в наличии"
                                            : product.stockStatus === "PREORDER"
                                                ? "Предзаказ"
                                                : `В наличии: ${product.stock}`}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">Кол-во</p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setQty(product, getQty(product) - 1)}
                                            disabled={getQty(product) <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            value={String(getQty(product))}
                                            readOnly
                                            className="h-9 w-14 text-center"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setQty(product, getQty(product) + 1)}
                                            disabled={getMaxQty(product) > 0 ? getQty(product) >= getMaxQty(product) : true}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="mt-auto flex justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleFavorite(siteId, product.id)}
                                    aria-label="Добавить в избранное"
                                >
                                    <Heart
                                        className={cn(
                                            "h-4 w-4",
                                            favoriteIds.includes(product.id) ? "fill-current" : "",
                                        )}
                                    />
                                </Button>

                                <Button
                                    type="button"
                                    variant={cartItemIdByProductId.has(product.id) || addedToCartIds.includes(product.id) ? "destructive" : "default"}
                                    onClick={() => {
                                        const max = getMaxQty(product);
                                        if (max === 0) return;

                                        const isInCart = cartItemIdByProductId.has(product.id);
                                        setPendingCartProductId(product.id);

                                        if (isInCart) {
                                            removeFromCartMutation.mutate(product.id, {
                                                onSuccess: (nextCart) => {
                                                    queryClient.setQueryData(queryKeys.siteCart(siteId, sessionId), nextCart);
                                                    setAddedToCartIds((prev) => prev.filter((id) => id !== product.id));
                                                },
                                                onError: (err) => {
                                                    window.alert(getRequestErrorMessage(err, "Не удалось убрать из корзины"));
                                                },
                                                onSettled: () => {
                                                    setPendingCartProductId(null);
                                                },
                                            });
                                            return;
                                        }

                                        const quantity = getQty(product);
                                        addToCartMutation.mutate(
                                            { productId: product.id, quantity },
                                            {
                                                onSuccess: (nextCart) => {
                                                    queryClient.setQueryData(queryKeys.siteCart(siteId, sessionId), nextCart);
                                                    setAddedToCartIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
                                                },
                                                onError: (err) => {
                                                    window.alert(getRequestErrorMessage(err, "Не удалось добавить в корзину"));
                                                },
                                                onSettled: () => {
                                                    setPendingCartProductId(null);
                                                },
                                            },
                                        );
                                    }}
                                    disabled={
                                        getMaxQty(product) === 0 ||
                                        ((addToCartMutation.isPending || removeFromCartMutation.isPending) && pendingCartProductId === product.id)
                                    }
                                >
                                    {(addToCartMutation.isPending || removeFromCartMutation.isPending) && pendingCartProductId === product.id ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {cartItemIdByProductId.has(product.id) ? "Удаляем" : "Добавляем"}
                                        </span>
                                    ) : cartItemIdByProductId.has(product.id) || addedToCartIds.includes(product.id) ? (
                                        "Убрать из корзины"
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" /> В корзину
                                        </span>
                                    )}
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

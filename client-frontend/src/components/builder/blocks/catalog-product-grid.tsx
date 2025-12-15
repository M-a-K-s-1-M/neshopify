'use client'

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
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

const MAX_PAGE_SIZE = 30;

function getPageItems(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: Array<number | "ellipsis"> = [];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    items.push(1);

    if (left > 2) {
        items.push("ellipsis");
    }

    for (let p = left; p <= right; p += 1) {
        items.push(p);
    }

    if (right < totalPages - 1) {
        items.push("ellipsis");
    }

    items.push(totalPages);
    return items;
}

export function CatalogProductGridBlock({ block, siteId }: CatalogProductGridProps) {
    const data = block.data ?? {};
    const selectedProductIds = Array.isArray((data as any).productIds)
        ? ((data as any).productIds as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(id))
        : [];
    const hasSelection = selectedProductIds.length > 0;
    const pageSize = MAX_PAGE_SIZE;
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

    useEffect(() => {
        const nextMaxPage = Math.max(1, Math.ceil(selectedProductIds.length / pageSize));
        if (page > nextMaxPage) {
            setPage(nextMaxPage);
        }
    }, [selectedProductIds.length, pageSize, page]);

    const curatedSlice = useMemo(() => {
        if (!hasSelection) return [];
        const start = (page - 1) * pageSize;
        return selectedProductIds.slice(start, start + pageSize);
    }, [hasSelection, selectedProductIds, page, pageSize]);

    const {
        data: curatedProducts,
        isLoading: curatedLoading,
        isFetching: curatedFetching,
        error: curatedError,
    } = useQuery({
        enabled: hasSelection,
        queryKey: [
            ...queryKeys.siteProducts(siteId),
            "selected",
            { ids: curatedSlice.join(","), page, limit: pageSize },
        ],
        queryFn: async () => {
            const results = await Promise.allSettled(curatedSlice.map((id) => ProductsApi.get(siteId, id)));
            return results
                .filter((r): r is PromiseFulfilledResult<ProductDto> => r.status === "fulfilled")
                .map((r) => r.value);
        },
        placeholderData: keepPreviousData,
    });

    const meta = { total: selectedProductIds.length, page, limit: pageSize };
    const hasAnyProducts = (meta.total ?? 0) > 0;
    const gridItems = curatedProducts ?? [];

    const isLoading = curatedLoading;
    const isFetching = curatedFetching;
    const error = curatedError;
    const isBusy = isFetching && Boolean(curatedProducts);

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

    const paginationItems = useMemo(() => getPageItems(meta.page, maxPage), [meta.page, maxPage]);

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
        <section className="space-y-4 bg-transparent">

            {isLoading ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {Array.from({ length: pageSize }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : gridItems.length ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
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
                <div className="py-6 text-center text-sm text-muted-foreground">
                    Выберите карточки товаров в настройках блока
                </div>
            )}

            {maxPage > 1 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-muted-foreground">
                        Страница {meta.page} из {maxPage}
                    </span>

                    <Pagination className="bg-transparent border-0 shadow-none">
                        <PaginationContent className="bg-transparent border-0 shadow-none">
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    size="default"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange("prev");
                                    }}
                                    className={cn(
                                        "bg-transparent border-0! shadow-none!",
                                        "hover:bg-transparent",
                                        (meta.page <= 1 || isBusy) ? "pointer-events-none opacity-50" : "",
                                    )}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Назад</span>
                                </PaginationLink>
                            </PaginationItem>

                            {paginationItems.map((item, index) => (
                                <PaginationItem key={`${item}-${index}`}>
                                    {item === "ellipsis" ? (
                                        <PaginationEllipsis className="text-muted-foreground" />
                                    ) : (
                                        <PaginationLink
                                            href="#"
                                            isActive={item === meta.page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (isBusy) return;
                                                setPage(item);
                                            }}
                                            className={cn(
                                                "bg-transparent border-0! shadow-none!",
                                                "hover:bg-transparent",
                                                item === meta.page ? "font-semibold text-foreground" : "text-muted-foreground",
                                                isBusy ? "pointer-events-none opacity-50" : "",
                                            )}
                                        >
                                            {item}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    size="default"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange("next");
                                    }}
                                    className={cn(
                                        "bg-transparent border-0! shadow-none!",
                                        "hover:bg-transparent",
                                        (meta.page >= maxPage || isBusy) ? "pointer-events-none opacity-50" : "",
                                    )}
                                >
                                    <span className="hidden sm:inline">Далее</span>
                                    <ChevronRight className="h-4 w-4" />
                                </PaginationLink>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            {queryError && <p className="text-sm text-destructive">{queryError}</p>}
        </section>
    );
}

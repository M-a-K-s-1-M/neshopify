'use client'

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BlockInstanceDto, PaginatedResponse, ProductDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { ProductsApi } from "@/lib/api/products";
import { PageBlocksApi } from "@/lib/api/page-blocks";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductsFeaturedProps {
    block: BlockInstanceDto;
    siteId: string;
}

const MAX_FEATURED_PRODUCTS = 4;
const EMPTY_FAVORITES: string[] = [];

export function ProductsFeaturedBlock({ block, siteId }: ProductsFeaturedProps) {
    const blockData =
        block.data && typeof block.data === "object" && !Array.isArray(block.data)
            ? (block.data as Record<string, unknown>)
            : ({} as Record<string, unknown>);
    const title = typeof blockData.title === "string" ? blockData.title : "Популярные товары";
    const subtitle = typeof blockData.subtitle === "string" ? blockData.subtitle : null;
    const productIds = getProductIdsFromBlock(block);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [canManage, setCanManage] = useState(false);
    const [quantityByProductId, setQuantityByProductId] = useState<Record<string, number>>({});
    const [pendingCartProductId, setPendingCartProductId] = useState<string | null>(null);
    const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);

    const favoriteIds = useFavoritesStore((state) => state.favoritesBySiteId[siteId] ?? EMPTY_FAVORITES);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const productKey = useMemo(() => productIds.join(','), [productIds]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        setCanManage(window.location.pathname.includes("/builder/"));
    }, []);

    useEffect(() => {
        if (!productIds.length) {
            setProducts([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all(productIds.map((id) => ProductsApi.get(siteId, id)))
            .then((items) => {
                if (!cancelled) {
                    setProducts(items);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Не удалось загрузить товары');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [productKey, productIds.length, siteId]);

    const addToCartMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            return CartApi.addItem(siteId, payload);
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
            <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-semibold">{title}</h2>
                        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
                    </div>
                    {canManage ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setIsManagerOpen(true)}>
                                Управлять товарами
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <a
                                    href={`/sites/${siteId}/builder/catalog?mode=products`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Создать товар
                                </a>
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: productIds.length || MAX_FEATURED_PRODUCTS }).map((_, index) => (
                        <Skeleton key={index} className="h-48 rounded-xl" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {!loading && !error && (
                <div className="grid gap-4 sm:grid-cols-2 3xl:grid-cols-4">
                    {products.length > 0 ? (
                        products.map((product) => (
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

                                <CardHeader className="gap-1">
                                    <CardTitle className="line-clamp-2 text-base leading-snug">{product.title}</CardTitle>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {product.description?.trim() ? product.description : "Описание отсутствует"}
                                    </p>
                                </CardHeader>

                                <CardContent className="space-y-1">
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
                                        onClick={() => {
                                            const max = getMaxQty(product);
                                            if (max === 0) return;

                                            const quantity = getQty(product);
                                            setPendingCartProductId(product.id);
                                            addToCartMutation.mutate(
                                                { productId: product.id, quantity },
                                                {
                                                    onSuccess: () => {
                                                        setLastAddedProductId(product.id);
                                                        window.setTimeout(() => setLastAddedProductId(null), 1200);
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
                                        disabled={getMaxQty(product) === 0 || (addToCartMutation.isPending && pendingCartProductId === product.id)}
                                    >
                                        {addToCartMutation.isPending && pendingCartProductId === product.id ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Добавляем
                                            </span>
                                        ) : lastAddedProductId === product.id ? (
                                            "Добавлено"
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" /> В корзину
                                            </span>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-6 text-center text-sm text-muted-foreground">
                            Добавьте товары в блок, чтобы показать витрину.
                        </Card>
                    )}
                </div>
            )}

            {canManage ? (
                <ProductsFeaturedManager
                    block={block}
                    siteId={siteId}
                    open={isManagerOpen}
                    onOpenChange={setIsManagerOpen}
                />
            ) : null}
        </section>
    );
}

interface ProductsFeaturedManagerProps {
    block: BlockInstanceDto;
    siteId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PICKER_PAGE_SIZE = 12;

function ProductsFeaturedManager({ block, siteId, open, onOpenChange }: ProductsFeaturedManagerProps) {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selection, setSelection] = useState<string[]>(() => getProductIdsFromBlock(block));
    const queryClient = useQueryClient();
    const activeSearch = search || undefined;

    useEffect(() => {
        if (open) {
            setSelection(getProductIdsFromBlock(block));
            setSearchInput("");
            setSearch("");
            setPage(1);
        }
    }, [open, block]);

    const { data, isLoading, isFetching, error } = useQuery<PaginatedResponse<ProductDto>>({
        queryKey: queryKeys.siteProductsList(siteId, page, activeSearch, PICKER_PAGE_SIZE),
        queryFn: () => ProductsApi.list(siteId, { page, limit: PICKER_PAGE_SIZE, search: activeSearch }),
        enabled: open,
        placeholderData: (previousData) => previousData,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // refetchInterval: open ? 4000 : false,
    });

    const productLookup = useMemo(() => {
        const map = new Map<string, ProductDto>();
        data?.data.forEach((product) => map.set(product.id, product));
        return map;
    }, [data]);

    const maxReached = selection.length >= MAX_FEATURED_PRODUCTS;

    const saveSelectionMutation = useMutation({
        mutationFn: (productIds: string[]) =>
            PageBlocksApi.update(siteId, block.pageId, block.id, {
                data: { ...(block.data ?? {}), productIds: productIds.slice(0, MAX_FEATURED_PRODUCTS) },
            }),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.page(siteId, block.pageId) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.pageBlocks(siteId, block.pageId) }),
            ]);
            onOpenChange(false);
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось обновить витрину"));
        },
    });

    const maxPage = Math.max(1, Math.ceil((data?.meta.total ?? 0) / (data?.meta.limit ?? PICKER_PAGE_SIZE)));
    const isBusy = isFetching && Boolean(data);
    const queryError = error ? "Не удалось загрузить товары" : null;

    const toggleProduct = (productId: string) => {
        setSelection((prev) => {
            if (prev.includes(productId)) {
                return prev;
            }
            if (prev.length >= MAX_FEATURED_PRODUCTS) {
                return prev;
            }
            return [...prev, productId];
        });
    };

    const removeProduct = (productId: string) => {
        setSelection((prev) => prev.filter((id) => id !== productId));
    };

    const handleSave = () => {
        saveSelectionMutation.mutate(selection);
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setSearch(searchInput.trim());
        setPage(1);
    };

    const handlePageChange = (direction: "next" | "prev") => {
        setPage((current) => {
            const nextPage = direction === "next" ? current + 1 : current - 1;
            if (nextPage < 1 || nextPage > maxPage) {
                return current;
            }
            return nextPage;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl md:min-w-3xl ">
                <DialogHeader>
                    <DialogTitle>Управление блоком «Популярные товары»</DialogTitle>
                    <DialogDescription>
                        Выберите товары из каталога или создайте новый, чтобы наполнить витрину.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="space-y-4 rounded-xl border border-border p-4">
                        <div>
                            <p className="text-sm font-semibold">Выбранные товары ({selection.length}/{MAX_FEATURED_PRODUCTS})</p>
                            <p className="text-xs text-muted-foreground">Максимум {MAX_FEATURED_PRODUCTS} товара в витрине.</p>
                            {selection.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Пока ничего не выбрано.</p>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selection.map((id) => {
                                        const product = productLookup.get(id);
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
                                                onClick={() => removeProduct(id)}
                                            >
                                                {product?.title ?? `Товар ${id.slice(0, 6)}`}
                                                <X className="h-3 w-3" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <a
                                href={`/sites/${siteId}/builder/catalog?mode=products`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Создать новый товар
                            </a>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                            <Input
                                placeholder="Поиск по каталогу"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="sm">
                                Искать
                            </Button>
                        </form>

                        {isLoading ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {Array.from({ length: PICKER_PAGE_SIZE }).map((_, index) => (
                                    <Skeleton key={index} className="h-28 rounded-lg" />
                                ))}
                            </div>
                        ) : data?.data.length ? (
                            <div className="space-y-3">
                                {data.data.map((product) => {
                                    const alreadySelected = selection.includes(product.id);
                                    const disableAdd = !alreadySelected && maxReached;
                                    return (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">{product.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {Number(product.price).toLocaleString('ru-RU')} {product.currency}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={alreadySelected ? "outline" : "secondary"}
                                                disabled={alreadySelected || disableAdd}
                                                onClick={() => toggleProduct(product.id)}
                                            >
                                                {alreadySelected ? "Добавлено" : disableAdd ? `Макс. ${MAX_FEATURED_PRODUCTS}` : "Добавить"}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">По запросу ничего не найдено.</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                Страница {data?.meta.page ?? page} из {maxPage}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange("prev")}
                                    disabled={(data?.meta.page ?? page) <= 1 || isBusy}
                                >
                                    Назад
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange("next")}
                                    disabled={(data?.meta.page ?? page) >= maxPage || isBusy}
                                >
                                    Далее
                                </Button>
                            </div>
                        </div>

                        {queryError ? <p className="text-sm text-destructive">{queryError}</p> : null}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saveSelectionMutation.isPending}
                    >
                        Отмена
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={saveSelectionMutation.isPending}>
                        {saveSelectionMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Сохраняем
                            </span>
                        ) : (
                            "Сохранить витрину"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function getProductIdsFromBlock(block: BlockInstanceDto) {
    const rawIds = (block.data?.productIds ?? []) as unknown;
    if (!Array.isArray(rawIds)) {
        return [] as string[];
    }
    return rawIds
        .filter((value): value is string => typeof value === "string")
        .slice(0, MAX_FEATURED_PRODUCTS);
}

function getFilteredProducts(products: ProductDto[], search: string) {
    return products;
}

'use client'

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { getOrCreateCartSessionId } from "@/lib/utils/cart-session";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCatalogFiltersOptional } from "../catalog-filters-context";
import { useSiteBasePath } from "@/components/providers/site-base-path-provider";
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
import {
    ProductCardOne,
    ProductCardThree,
    ProductCardTwo,
    type ProductCardDesignKey,
} from "@/components/shudcn-ui/product-cards";

interface CatalogProductGridProps {
    block: BlockInstanceDto;
    siteId: string;
}

const MAX_PAGE_SIZE = 30;

const DEFAULT_CARD_DESIGN: ProductCardDesignKey = "design-01";

function normalizeCardDesign(value: unknown): ProductCardDesignKey {
    if (value === "design-01" || value === "design-02" || value === "design-03") return value;
    return DEFAULT_CARD_DESIGN;
}

function toFiniteNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const num = typeof value === "number" ? value : Number(String(value).replace(/\s+/g, ""));
    return Number.isFinite(num) ? num : undefined;
}

function applyCatalogFilters(products: ProductDto[], filters: any | null | undefined): ProductDto[] {
    if (!filters) return products;

    const search = typeof filters.search === "string" ? filters.search.trim().toLowerCase() : "";
    const categoryIds = Array.isArray(filters.categoryIds)
        ? (filters.categoryIds as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(id))
        : [];
    const categorySet = categoryIds.length ? new Set(categoryIds) : null;

    const min = toFiniteNumber(filters.priceMin);
    const max = toFiniteNumber(filters.priceMax);

    const hasAny = Boolean(search) || Boolean(categorySet) || min !== undefined || max !== undefined;
    if (!hasAny) return products;

    return products.filter((product) => {
        if (search) {
            const hay = `${product.title ?? ""} ${product.description ?? ""}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }

        if (categorySet) {
            const categoryId = (product as any).categoryId;
            if (typeof categoryId !== "string" || !categorySet.has(categoryId)) return false;
        }

        const price = toFiniteNumber((product as any).price);
        if (min !== undefined && price !== undefined && price < min) return false;
        if (max !== undefined && price !== undefined && price > max) return false;

        return true;
    });
}

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

function isCustomerForCurrentStore(user: any, siteId: string) {
    if (!user) return false;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    return roles.includes('CUSTOMER') && user.siteId === siteId;
}

function resolveCustomerUserId(user: any, siteId: string) {
    if (!user) return null;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    if (!roles.includes('CUSTOMER')) return null;
    if (user.siteId !== siteId) return null;
    return typeof user.sub === 'string' ? user.sub : null;
}

export function CatalogProductGridBlock({ block, siteId }: CatalogProductGridProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const basePath = useSiteBasePath();
    const user = useAuthStore((s) => s.user);
    const refresh = useAuthStore((s) => s.refresh);

    const data = block.data ?? {};
    const cardDesign = normalizeCardDesign((data as any).cardDesign);
    const selectedProductIds = Array.isArray((data as any).productIds)
        ? ((data as any).productIds as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(id))
        : [];
    const hasSelection = selectedProductIds.length > 0;
    const pageSize = MAX_PAGE_SIZE;
    const [page, setPage] = useState(1);
    const [pendingCartProductId, setPendingCartProductId] = useState<string | null>(null);
    const [addedToCartIds, setAddedToCartIds] = useState<string[]>([]);

    const customerUserId = useMemo(() => resolveCustomerUserId(user, siteId), [siteId, user]);
    const favoriteIds = useFavoritesStore((state) => state.getFavorites(siteId, customerUserId));
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

    const catalogFilters = useCatalogFiltersOptional();

    const queryClient = useQueryClient();

    const normalizedBasePath = useMemo(() => basePath.replace(/\/+$/, ""), [basePath]);
    const returnTo = useMemo(() => {
        const query = searchParams.toString();
        return query ? `${pathname}?${query}` : pathname;
    }, [pathname, searchParams]);

    const redirectToStoreAuth = useMemo(() => {
        return () => {
            if (!normalizedBasePath) return;
            const params = new URLSearchParams();
            if (returnTo) params.set('returnTo', returnTo);
            const url = params.toString()
                ? `${normalizedBasePath}/auth?${params.toString()}`
                : `${normalizedBasePath}/auth`;
            router.push(url);
        };
    }, [normalizedBasePath, returnTo, router]);

    const ensureCustomerAuth = useMemo(() => {
        return async () => {
            const payload = user ?? (await refresh());
            return Boolean(payload && isCustomerForCurrentStore(payload, siteId));
        };
    }, [refresh, siteId, user]);

    const cartQueryKey = useMemo(
        () => queryKeys.siteCart(siteId, { userId: customerUserId ?? null }),
        [customerUserId, siteId],
    );

    const { data: cart } = useQuery({
        enabled: Boolean(customerUserId),
        queryKey: cartQueryKey,
        queryFn: () => CartApi.getCart(siteId),
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

    const filteredGridItems = useMemo(() => {
        return applyCatalogFilters(gridItems, catalogFilters?.filters);
    }, [gridItems, catalogFilters?.filters]);

    const filtersSignature = useMemo(() => {
        const f = catalogFilters?.filters;
        if (!f) return "";
        const search = typeof f.search === "string" ? f.search.trim() : "";
        const categories = Array.isArray(f.categoryIds) ? (f.categoryIds as unknown[]).filter(Boolean).join(",") : "";
        const min = f.priceMin ?? "";
        const max = f.priceMax ?? "";
        return `${search}|${categories}|${min}|${max}`;
    }, [catalogFilters?.filters]);

    useEffect(() => {
        if (!filtersSignature) return;
        setPage(1);
    }, [filtersSignature]);

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
                return CartApi.getCart(siteId);
            }
            return CartApi.removeItem(siteId, itemId);
        },
    });

    const getMaxQty = (product: ProductDto) => {
        if (product.stockStatus === "OUT_OF_STOCK") return 0;
        if (product.stockStatus === "PREORDER") return 99;
        return Math.max(0, Number(product.stock) || 0);
    };

    const CardComponent =
        cardDesign === "design-02" ? ProductCardTwo : cardDesign === "design-03" ? ProductCardThree : ProductCardOne;

    return (
        <section className="space-y-4 bg-transparent">

            {isLoading ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {Array.from({ length: pageSize }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : filteredGridItems.length ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {filteredGridItems.map((product) => {
                        const inCart = cartItemIdByProductId.has(product.id) || addedToCartIds.includes(product.id);
                        const busy =
                            (addToCartMutation.isPending || removeFromCartMutation.isPending) && pendingCartProductId === product.id;

                        const handleToggleCart = () => {
                            void (async () => {
                                const max = getMaxQty(product);
                                if (max === 0) return;

                                const authed = await ensureCustomerAuth();
                                if (!authed) {
                                    redirectToStoreAuth();
                                    return;
                                }

                                setPendingCartProductId(product.id);

                                if (cartItemIdByProductId.has(product.id)) {
                                    removeFromCartMutation.mutate(product.id, {
                                        onSuccess: (nextCart) => {
                                            queryClient.setQueryData(cartQueryKey, nextCart);
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

                                addToCartMutation.mutate(
                                    { productId: product.id, quantity: 1 },
                                    {
                                        onSuccess: (nextCart) => {
                                            queryClient.setQueryData(cartQueryKey, nextCart);
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
                            })();
                        };

                        const handleToggleFavorite = () => {
                            void (async () => {
                                const authed = await ensureCustomerAuth();
                                if (!authed) {
                                    redirectToStoreAuth();
                                    return;
                                }
                                toggleFavorite(siteId, product.id, customerUserId);
                            })();
                        };

                        return (
                            <CardComponent
                                key={product.id}
                                product={product}
                                className="max-w-none h-full"
                                isFavorited={favoriteIds.includes(product.id)}
                                onToggleFavorite={handleToggleFavorite}
                                inCart={inCart}
                                cartBusy={busy}
                                onToggleCart={handleToggleCart}
                            />
                        );
                    })}
                </div>
            ) : hasSelection ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    Ничего не найдено
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
                                    className={[
                                        "bg-transparent border-0! shadow-none!",
                                        "hover:bg-transparent",
                                        meta.page <= 1 || isBusy ? "pointer-events-none opacity-50" : "",
                                    ].join(" ")}
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
                                            className={[
                                                "bg-transparent border-0! shadow-none!",
                                                "hover:bg-transparent",
                                                item === meta.page ? "font-semibold text-foreground" : "text-muted-foreground",
                                                isBusy ? "pointer-events-none opacity-50" : "",
                                            ].join(" ")}
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
                                    className={[
                                        "bg-transparent border-0! shadow-none!",
                                        "hover:bg-transparent",
                                        meta.page >= maxPage || isBusy ? "pointer-events-none opacity-50" : "",
                                    ].join(" ")}
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

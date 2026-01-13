'use client'

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSiteBasePath } from "@/components/providers/site-base-path-provider";
import { ProductCardOne } from "@/components/shudcn-ui/product-cards";

const EMPTY_FAVORITES: string[] = [];

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

export function ProfileFavoritesShowcaseBlock({
    block,
    siteId,
}: {
    block: BlockInstanceDto;
    siteId: string;
}) {
    void block;
    const title = "Избранные товары";

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const basePath = useSiteBasePath();

    const user = useAuthStore((s) => s.user);
    const refresh = useAuthStore((s) => s.refresh);
    const customerUserId = useMemo(() => resolveCustomerUserId(user as any, siteId), [siteId, user]);

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
            const payload = (user as any) ?? (await refresh());
            return Boolean(payload && isCustomerForCurrentStore(payload, siteId));
        };
    }, [refresh, siteId, user]);

    const favoriteIds = useFavoritesStore((state) => state.getFavorites(siteId, customerUserId) ?? EMPTY_FAVORITES);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const favoriteKey = useMemo(() => favoriteIds.slice().sort().join(','), [favoriteIds]);
    const [items, setItems] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();
    const cartQueryKey = useMemo(
        () => queryKeys.siteCart(siteId, { userId: customerUserId ?? null }),
        [customerUserId, siteId],
    );
    const [pendingCartProductId, setPendingCartProductId] = useState<string | null>(null);

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

    const cartItemQtyByProductId = useMemo(() => {
        const map = new Map<string, number>();
        cart?.items?.forEach((item) => {
            map.set(item.productId, Number(item.quantity) || 0);
        });
        return map;
    }, [cart]);

    const addToCartMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            return CartApi.addItem(siteId, payload);
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId: string) => {
            const itemId = cartItemIdByProductId.get(productId);
            if (!itemId) {
                return CartApi.getCart(siteId);
            }
            return CartApi.removeItem(siteId, itemId);
        },
    });

    const updateCartItemMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            const itemId = cartItemIdByProductId.get(payload.productId);
            if (!itemId) {
                return CartApi.getCart(siteId);
            }
            return CartApi.updateItem(siteId, itemId, { quantity: payload.quantity });
        },
    });

    const getMaxQty = (product: ProductDto) => {
        if (product.stockStatus === "OUT_OF_STOCK") return 0;
        if (product.stockStatus === "PREORDER") return 99;
        return Math.max(0, Number(product.stock) || 0);
    };

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
                            onToggleFavorite={() => {
                                void (async () => {
                                    const authed = await ensureCustomerAuth();
                                    if (!authed) {
                                        redirectToStoreAuth();
                                        return;
                                    }
                                    toggleFavorite(siteId, item.id, customerUserId);
                                })();
                            }}
                            className="max-w-none"
                            inCart={cartItemIdByProductId.has(item.id)}
                            cartQuantity={cartItemQtyByProductId.get(item.id) ?? 0}
                            cartBusy={
                                (addToCartMutation.isPending || removeFromCartMutation.isPending || updateCartItemMutation.isPending) &&
                                pendingCartProductId === item.id
                            }
                            onAddToCart={(quantity) => {
                                void (async () => {
                                    const max = getMaxQty(item);
                                    if (max === 0) return;
                                    if (cartItemIdByProductId.has(item.id)) return;

                                    const authed = await ensureCustomerAuth();
                                    if (!authed) {
                                        redirectToStoreAuth();
                                        return;
                                    }

                                    const qty = Math.max(1, Math.min(max, Number(quantity) || 1));
                                    setPendingCartProductId(item.id);
                                    addToCartMutation.mutate(
                                        { productId: item.id, quantity: qty },
                                        {
                                            onSuccess: (nextCart) => {
                                                queryClient.setQueryData(cartQueryKey, nextCart);
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
                            }}
                            onRemoveFromCart={() => {
                                void (async () => {
                                    const authed = await ensureCustomerAuth();
                                    if (!authed) {
                                        redirectToStoreAuth();
                                        return;
                                    }

                                    setPendingCartProductId(item.id);
                                    removeFromCartMutation.mutate(item.id, {
                                        onSuccess: (nextCart) => {
                                            queryClient.setQueryData(cartQueryKey, nextCart);
                                        },
                                        onError: (err) => {
                                            window.alert(getRequestErrorMessage(err, "Не удалось убрать из корзины"));
                                        },
                                        onSettled: () => {
                                            setPendingCartProductId(null);
                                        },
                                    });
                                })();
                            }}
                            onUpdateCartQuantity={(quantity) => {
                                void (async () => {
                                    if (!cartItemIdByProductId.has(item.id)) return;

                                    const max = getMaxQty(item);
                                    const currentQty = cartItemQtyByProductId.get(item.id) ?? 1;
                                    const effectiveMax = max > 0 ? max : Math.max(1, currentQty);
                                    const qty = Math.max(1, Math.min(effectiveMax, Number(quantity) || 1));

                                    const authed = await ensureCustomerAuth();
                                    if (!authed) {
                                        redirectToStoreAuth();
                                        return;
                                    }

                                    setPendingCartProductId(item.id);
                                    updateCartItemMutation.mutate(
                                        { productId: item.id, quantity: qty },
                                        {
                                            onSuccess: (nextCart) => {
                                                queryClient.setQueryData(cartQueryKey, nextCart);
                                            },
                                            onError: (err) => {
                                                window.alert(getRequestErrorMessage(err, "Не удалось изменить количество"));
                                            },
                                            onSettled: () => {
                                                setPendingCartProductId(null);
                                            },
                                        },
                                    );
                                })();
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

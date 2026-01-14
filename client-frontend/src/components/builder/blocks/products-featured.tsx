'use client'

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/utils/media";
import { resolveSiteHref, useSiteBasePath } from "@/components/providers/site-base-path-provider";
import { ProductDetailsDialog } from "@/components/shudcn-ui/product-cards/product-details-dialog";
import { useAuthStore } from "@/stores/useAuthStore";

interface ProductsFeaturedProps {
    block: BlockInstanceDto;
    siteId: string;
}

const MAX_FEATURED_PRODUCTS = 4;

type ProductsFeaturedBackground = "default" | "card" | "muted";

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

function getMaxQty(product: ProductDto): number {
    if (product.stockStatus === "OUT_OF_STOCK") return 0;
    if (product.stockStatus === "PREORDER") return 99;
    return Math.max(0, Number(product.stock) || 0);
}

export function ProductsFeaturedBlock({ block, siteId }: ProductsFeaturedProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const basePath = useSiteBasePath();
    const user = useAuthStore((s) => s.user);
    const refresh = useAuthStore((s) => s.refresh);
    const queryClient = useQueryClient();

    const customerUserId = useMemo(() => resolveCustomerUserId(user, siteId), [siteId, user]);

    const normalizedBasePath = useMemo(() => basePath.replace(/\/+$/, ""), [basePath]);
    const returnTo = useMemo(() => {
        const query = searchParams?.toString() ?? "";
        return query ? `${pathname}?${query}` : pathname;
    }, [pathname, searchParams]);

    const redirectToStoreRegister = useMemo(() => {
        return () => {
            if (!normalizedBasePath) return;
            const params = new URLSearchParams();
            if (returnTo) params.set('returnTo', returnTo);
            const url = params.toString()
                ? `${normalizedBasePath}/auth/register?${params.toString()}`
                : `${normalizedBasePath}/auth/register`;
            router.push(url);
        };
    }, [normalizedBasePath, returnTo, router]);

    const ensureCustomerAuth = useMemo(() => {
        return async () => {
            const payload = user ?? (await refresh());
            return Boolean(payload && isCustomerForCurrentStore(payload, siteId));
        };
    }, [refresh, siteId, user]);
    const blockData =
        block.data && typeof block.data === "object" && !Array.isArray(block.data)
            ? (block.data as Record<string, unknown>)
            : ({} as Record<string, unknown>);

    const title = typeof blockData.title === "string" ? blockData.title : "Популярные товары";
    const subtitle = typeof blockData.subtitle === "string" ? blockData.subtitle : null;
    const background =
        typeof blockData.background === "string" ? (blockData.background as ProductsFeaturedBackground) : "default";
    const productIds = getProductIdsFromBlock(block);

    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        cart?.items?.forEach((item: any) => {
            map.set(item.productId, item.id);
        });
        return map;
    }, [cart]);

    const cartItemQtyByProductId = useMemo(() => {
        const map = new Map<string, number>();
        cart?.items?.forEach((item: any) => {
            map.set(item.productId, Number(item.quantity) || 0);
        });
        return map;
    }, [cart]);

    const [pendingCartProductId, setPendingCartProductId] = useState<string | null>(null);

    const addToCartMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            return CartApi.addItem(siteId, payload);
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId: string) => {
            const itemId = cartItemIdByProductId.get(productId);
            if (!itemId) return CartApi.getCart(siteId);
            return CartApi.removeItem(siteId, itemId);
        },
    });

    const updateCartItemMutation = useMutation({
        mutationFn: async (payload: { productId: string; quantity: number }) => {
            const itemId = cartItemIdByProductId.get(payload.productId);
            if (!itemId) return CartApi.getCart(siteId);
            return CartApi.updateItem(siteId, itemId, { quantity: payload.quantity });
        },
    });

    const sectionBgClass =
        background === "card" ? "bg-card" : background === "muted" ? "bg-muted" : "";

    const productKey = useMemo(() => productIds.join(","), [productIds]);

    useEffect(() => {
        if (!productIds.length) {
            setProducts([]);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.allSettled(productIds.map((id) => ProductsApi.get(siteId, id)))
            .then((results) => {
                if (cancelled) return;
                const items = results
                    .filter((r): r is PromiseFulfilledResult<ProductDto> => r.status === "fulfilled")
                    .map((r) => r.value);
                setProducts(items);
            })
            .catch(() => {
                if (!cancelled) {
                    setError("Не удалось загрузить товары");
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

    return (
        <section className={cn("w-full", sectionBgClass)}>
            <div className="px-6 py-12">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
                        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                    </div>

                    <Link
                        href={resolveSiteHref("/catalog", basePath)}
                        className="text-sm font-medium text-primary hover:underline"
                        aria-label="Перейти в каталог"
                    >
                        Все товары
                    </Link>
                </div>

                <div className="mt-10">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: MAX_FEATURED_PRODUCTS }).map((_, index) => (
                                <div key={index} className="space-y-4">
                                    <Skeleton className="aspect-square w-full rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : productIds.length === 0 ? (
                        <div className="py-6 text-left text-sm text-muted-foreground">
                            Выберите карточки товаров в настройках блока
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => {
                                const media = product.media?.slice().sort((a, b) => a.order - b.order) ?? [];
                                const cover = media[0] ?? null;
                                const price = Number(product.price);
                                const priceLabel = Number.isFinite(price)
                                    ? `${price.toLocaleString("ru-RU")} ${product.currency}`.trim()
                                    : String(product.price);

                                const inCart = cartItemIdByProductId.has(product.id);
                                const cartQuantity = cartItemQtyByProductId.get(product.id) ?? (inCart ? 1 : 0);
                                const busy =
                                    (addToCartMutation.isPending || removeFromCartMutation.isPending || updateCartItemMutation.isPending) &&
                                    pendingCartProductId === product.id;

                                const handleAddToCart = (quantity: number) => {
                                    void (async () => {
                                        const max = getMaxQty(product);
                                        if (max === 0) return;
                                        if (cartItemIdByProductId.has(product.id)) return;

                                        const authed = await ensureCustomerAuth();
                                        if (!authed) {
                                            redirectToStoreRegister();
                                            return;
                                        }

                                        const qty = Math.max(1, Math.min(max, Number(quantity) || 1));
                                        setPendingCartProductId(product.id);

                                        addToCartMutation.mutate(
                                            { productId: product.id, quantity: qty },
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
                                };

                                const handleRemoveFromCart = () => {
                                    void (async () => {
                                        const authed = await ensureCustomerAuth();
                                        if (!authed) {
                                            redirectToStoreRegister();
                                            return;
                                        }

                                        setPendingCartProductId(product.id);
                                        removeFromCartMutation.mutate(product.id, {
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
                                };

                                const handleUpdateCartQuantity = (quantity: number) => {
                                    void (async () => {
                                        if (!cartItemIdByProductId.has(product.id)) return;

                                        const max = getMaxQty(product);
                                        const effectiveMax = max > 0 ? max : Math.max(1, cartQuantity);
                                        const qty = Math.max(1, Math.min(effectiveMax, Number(quantity) || 1));

                                        const authed = await ensureCustomerAuth();
                                        if (!authed) {
                                            redirectToStoreRegister();
                                            return;
                                        }

                                        setPendingCartProductId(product.id);
                                        updateCartItemMutation.mutate(
                                            { productId: product.id, quantity: qty },
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
                                };

                                return (
                                    <ProductDetailsDialog
                                        key={product.id}
                                        product={product}
                                        inCart={inCart}
                                        cartQuantity={cartQuantity}
                                        cartBusy={busy}
                                        onAddToCart={handleAddToCart}
                                        onRemoveFromCart={handleRemoveFromCart}
                                        onUpdateCartQuantity={handleUpdateCartQuantity}
                                        trigger={
                                            <button
                                                type="button"
                                                className={cn(
                                                    "group w-full text-left space-y-4 rounded-2xl outline-none cursor-pointer",
                                                    "transition-all duration-200",
                                                    "hover:-translate-y-0.5 hover:shadow-lg",
                                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                                )}
                                                aria-label={`Открыть товар: ${product.title}`}
                                            >
                                                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                                                    {cover ? (
                                                        <Image
                                                            src={resolveMediaUrl(cover.url)}
                                                            alt={cover.alt ?? product.title}
                                                            fill
                                                            unoptimized
                                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-base font-semibold text-primary">{product.title}</p>
                                                    {product.description?.trim() ? (
                                                        <p className="line-clamp-1 text-sm text-muted-foreground">
                                                            {product.description}
                                                        </p>
                                                    ) : null}
                                                    <p className="text-sm font-semibold text-primary">{priceLabel}</p>
                                                </div>
                                            </button>
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function getProductIdsFromBlock(block: BlockInstanceDto) {
    const rawIds = (block.data?.productIds ?? []) as unknown;
    if (!Array.isArray(rawIds)) {
        return [] as string[];
    }
    return rawIds
        .filter((value): value is string => typeof value === "string" && Boolean(value))
        .slice(0, MAX_FEATURED_PRODUCTS);
}

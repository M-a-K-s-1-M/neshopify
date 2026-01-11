'use client'

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlockInstanceDto } from "@/lib/types";
import type { CartDto, CartItemDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/utils/media";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

function resolveCustomerUserId(user: any, siteId: string) {
    if (!user) return null;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    if (!roles.includes('CUSTOMER')) return null;
    if (user.siteId !== siteId) return null;
    return typeof user.sub === 'string' ? user.sub : null;
}

export function CartItemsListBlock({ block, siteId }: { block: BlockInstanceDto; siteId: string }) {
    const title = block.template.title ?? "Корзина";

    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const customerUserId = useMemo(() => resolveCustomerUserId(user, siteId), [siteId, user]);
    const cartQueryKey = useMemo(
        () => queryKeys.siteCart(siteId, { userId: customerUserId ?? null }),
        [customerUserId, siteId],
    );

    const { data: cart, isLoading, isFetching, error } = useQuery<CartDto>({
        enabled: Boolean(customerUserId),
        queryKey: cartQueryKey,
        queryFn: () => CartApi.getCart(siteId),
    });

    const updateItemMutation = useMutation({
        mutationFn: async (payload: { itemId: string; quantity: number }) => {
            return CartApi.updateItem(siteId, payload.itemId, { quantity: payload.quantity });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: cartQueryKey });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось обновить количество"));
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return CartApi.removeItem(siteId, itemId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: cartQueryKey });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось удалить товар из корзины"));
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            return CartApi.clear(siteId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: cartQueryKey });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось очистить корзину"));
        },
    });

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const email = user?.email;
            if (!email) {
                throw new Error('Email пользователя не найден');
            }

            const current = new URL(window.location.href);
            const cartUrl = `${current.origin}${current.pathname}`;
            const successUrl = `${cartUrl}?checkout=success`;
            const cancelUrl = `${cartUrl}?checkout=cancel`;

            return CartApi.checkoutStripe(siteId, {
                customerEmail: email,
                successUrl,
                cancelUrl,
            });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, 'Не удалось начать оплату'));
        },
    });

    const items: CartItemDto[] = cart?.items ?? [];
    const currency = items.find((i) => i.product?.currency)?.product?.currency ?? "RUB";

    const total = useMemo(() => {
        if (!cart) return 0;
        if (cart.total != null) {
            const parsed = Number(cart.total);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    }, [cart, items]);

    const formattedTotal = `${total.toLocaleString("ru-RU")} ${currency}`;
    const isBusy =
        isFetching ||
        updateItemMutation.isPending ||
        removeItemMutation.isPending ||
        clearCartMutation.isPending ||
        checkoutMutation.isPending;
    const queryError = error ? "Не удалось загрузить корзину" : null;

    const subtotal = total;
    const shipping = 0;
    const vat = 0;
    const grandTotal = subtotal + shipping + vat;

    const formatMoney = (amount: number, curr: string) => `${amount.toLocaleString("ru-RU")} ${curr}`;

    return (
        <section className="space-y-4">

            <Card className="overflow-hidden border border-border bg-card shadow-md">
                <div className="bg-linear-to-r from-primary to-secondary px-5 py-4 text-primary-foreground">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10">
                                <ShoppingCart className="h-4 w-4" />
                            </div>
                            <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => clearCartMutation.mutate()}
                            disabled={isBusy || items.length === 0}
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                        >
                            {clearCartMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Очищаем
                                </span>
                            ) : (
                                "Очистить"
                            )}
                        </Button>
                    </div>
                </div>

                <div className="p-5">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <Skeleton key={idx} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Корзина пуста.</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {items.map((item) => {
                                const product = item.product;
                                const productTitle = product?.title ?? "Товар";
                                const itemCurrency = product?.currency ?? currency;
                                const unitPrice = Number(item.price) || 0;
                                const rowTotal = unitPrice * item.quantity;
                                const maxQty = product?.stockStatus === "IN_STOCK" ? Math.max(1, product.stock) : 99;
                                const cover = product?.media
                                    ?.slice()
                                    ?.sort((a, b) => a.order - b.order)
                                    ?.[0];

                                return (
                                    <div key={item.id} className="py-4">
                                        <div className="grid grid-cols-[52px_1fr] items-center gap-3 sm:grid-cols-[64px_1fr_auto_auto]">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted sm:h-14 sm:w-14">
                                                {cover?.url ? (
                                                    <Image
                                                        src={resolveMediaUrl(cover.url)}
                                                        alt={cover.alt ?? productTitle}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{productTitle}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatMoney(unitPrice, itemCurrency)}
                                                </p>
                                            </div>

                                            <div className="col-span-2 mt-3 flex items-center justify-between gap-3 sm:col-span-1 sm:mt-0">
                                                <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const next = Math.max(1, item.quantity - 1);
                                                            updateItemMutation.mutate({ itemId: item.id, quantity: next });
                                                        }}
                                                        disabled={isBusy || item.quantity <= 1}
                                                        className="h-8 w-8"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const next = Math.min(maxQty, item.quantity + 1);
                                                            updateItemMutation.mutate({ itemId: item.id, quantity: next });
                                                        }}
                                                        disabled={isBusy || item.quantity >= maxQty}
                                                        className="h-8 w-8"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <p className="min-w-[88px] text-right text-sm font-semibold text-foreground">
                                                        {formatMoney(rowTotal, itemCurrency)}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItemMutation.mutate(item.id)}
                                                        disabled={isBusy}
                                                        aria-label="Удалить"
                                                        className={cn(
                                                            "h-8 w-8 text-muted-foreground",
                                                            "hover:text-foreground hover:bg-muted/40",
                                                        )}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 rounded-lg border border-border bg-background/20 p-4">
                        <p className="text-base font-semibold text-foreground">Итого</p>

                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Подытог</span>
                                <span>{formatMoney(subtotal, currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Доставка</span>
                                <span>{formatMoney(shipping, currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>НДС</span>
                                <span>{formatMoney(vat, currency)}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                                <span className="font-semibold">Итого</span>
                                <span className="font-semibold text-primary">{formatMoney(grandTotal, currency)}</span>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                            <Button
                                type="button"
                                disabled={isBusy || items.length === 0}
                                className={cn(
                                    "w-full text-primary-foreground",
                                    "bg-linear-to-r from-primary to-secondary",
                                    "hover:opacity-90",
                                )}
                                onClick={() => {
                                    checkoutMutation.mutate(undefined, {
                                        onSuccess: (res) => {
                                            if (res?.checkoutUrl) {
                                                window.location.href = res.checkoutUrl;
                                            } else {
                                                window.alert('Не удалось получить ссылку на оплату');
                                            }
                                        },
                                    });
                                }}
                            >
                                {checkoutMutation.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Переходим…
                                    </span>
                                ) : (
                                    'Перейти к оформлению'
                                )}
                            </Button>

                            <Button type="button" variant="outline" className="w-full" disabled={isBusy}>
                                Продолжить покупки
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {queryError ? <p className="text-sm text-destructive">{queryError}</p> : null}
        </section>
    );
}

'use client'

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BlockInstanceDto } from "@/lib/types";
import type { CartDto, CartItemDto } from "@/lib/types";
import { CartApi } from "@/lib/api/cart";
import { getOrCreateCartSessionId } from "@/lib/utils/cart-session";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";

export function CartItemsListBlock({ block, siteId }: { block: BlockInstanceDto; siteId: string }) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const note = typeof data.note === "string" ? data.note : undefined;

    const queryClient = useQueryClient();
    const sessionId = useMemo(() => getOrCreateCartSessionId(), []);

    const { data: cart, isLoading, isFetching, error } = useQuery<CartDto>({
        queryKey: queryKeys.siteCart(siteId, sessionId),
        queryFn: () => CartApi.getCart(siteId, sessionId),
    });

    const updateItemMutation = useMutation({
        mutationFn: async (payload: { itemId: string; quantity: number }) => {
            return CartApi.updateItem(siteId, payload.itemId, { quantity: payload.quantity, sessionId });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteCart(siteId, sessionId) });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось обновить количество"));
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return CartApi.removeItem(siteId, itemId, sessionId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteCart(siteId, sessionId) });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось удалить товар из корзины"));
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            return CartApi.clear(siteId, sessionId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteCart(siteId, sessionId) });
        },
        onError: (err) => {
            window.alert(getRequestErrorMessage(err, "Не удалось очистить корзину"));
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
    const isBusy = isFetching || updateItemMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending;
    const queryError = error ? "Не удалось загрузить корзину" : null;

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {note ? <p className="text-muted-foreground">{note}</p> : null}
            </div>

            <Card className="p-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton key={idx} className="h-10 w-full" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Корзина пуста.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Товар</TableHead>
                                <TableHead>Количество</TableHead>
                                <TableHead className="text-right">Сумма</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => {
                                const title = item.product?.title ?? "Товар";
                                const maxQty = item.product?.stockStatus === "IN_STOCK" ? Math.max(1, item.product.stock) : 99;
                                const itemCurrency = item.product?.currency ?? currency;
                                const rowTotal = Number(item.price) * item.quantity;

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        const next = Math.max(1, item.quantity - 1);
                                                        updateItemMutation.mutate({ itemId: item.id, quantity: next });
                                                    }}
                                                    disabled={isBusy || item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        const next = Math.min(maxQty, item.quantity + 1);
                                                        updateItemMutation.mutate({ itemId: item.id, quantity: next });
                                                    }}
                                                    disabled={isBusy || item.quantity >= maxQty}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {rowTotal.toLocaleString("ru-RU")} {itemCurrency}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeItemMutation.mutate(item.id)}
                                                disabled={isBusy}
                                                aria-label="Удалить"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Итого</p>
                    <p className="text-2xl font-semibold">{formattedTotal}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => clearCartMutation.mutate()}
                        disabled={isBusy || items.length === 0}
                    >
                        {clearCartMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Очищаем
                            </span>
                        ) : (
                            "Очистить корзину"
                        )}
                    </Button>
                </div>
            </Card>

            {queryError ? <p className="text-sm text-destructive">{queryError}</p> : null}
        </section>
    );
}

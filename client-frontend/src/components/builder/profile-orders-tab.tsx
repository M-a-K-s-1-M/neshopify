"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { OrdersApi } from "@/lib/api/orders";
import { ProductsApi } from "@/lib/api/products";
import type { OrderDto, OrderStatus, ProductDto } from "@/lib/types";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetailsDialog } from "@/components/shudcn-ui/product-cards";
import { resolveMediaUrl } from "@/lib/utils/media";

const ORDERS_PAGE_SIZE = 4;

function formatOrderStatus(status: OrderStatus): string {
    switch (status) {
        case "DRAFT":
            return "Черновик";
        case "PENDING":
            return "Ожидает";
        case "CONFIRMED":
            return "Подтверждён";
        case "FULFILLED":
            return "Выполнен";
        case "CANCELLED":
            return "Отменён";
        default:
            return status;
    }
}

function formatDate(value: string): string {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return value;
    return d.toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toNumber(value: unknown): number {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount: number, currency: string): string {
    return `${amount.toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} ${currency}`;
}

function getOrderCurrency(order: OrderDto, productsById: Record<string, ProductDto>): string {
    for (const item of order.items ?? []) {
        const currency = productsById[item.productId]?.currency;
        if (currency) return currency;
    }
    return "RUB";
}

export function ProfileOrdersTab({ siteId }: { siteId: string }) {
    const isAuth = useAuthStore((s) => s.isAuth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [productsById, setProductsById] = useState<Record<string, ProductDto>>({});
    const [page, setPage] = useState(1);

    const enabled = isAuth && Boolean(siteId);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!enabled) return;
            setLoading(true);
            setError(null);
            try {
                const data = await OrdersApi.listMyPaid(siteId);
                if (!cancelled) {
                    setOrders(Array.isArray(data) ? data : []);
                    setPage(1);
                }
            } catch (e) {
                if (!cancelled) setError(getRequestErrorMessage(e, "Не удалось загрузить заказы"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [enabled, siteId]);

    const productIds = useMemo(() => {
        const ids = new Set<string>();
        for (const order of orders) {
            for (const item of order.items ?? []) {
                if (item?.productId) ids.add(item.productId);
            }
        }
        return Array.from(ids);
    }, [orders]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!enabled) return;
            if (productIds.length === 0) return;

            const missing = productIds.filter((id) => !productsById[id]);
            if (missing.length === 0) return;

            try {
                const fetched = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            return await ProductsApi.get(siteId, id);
                        } catch {
                            return null;
                        }
                    }),
                );

                if (cancelled) return;
                setProductsById((prev) => {
                    const next: Record<string, ProductDto> = { ...prev };
                    for (const p of fetched) {
                        if (p?.id) next[p.id] = p;
                    }
                    return next;
                });
            } finally {
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [enabled, siteId, productIds, productsById]);

    const hasOrders = orders.length > 0;
    const maxPage = useMemo(() => Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE)), [orders.length]);
    const pageOrders = useMemo(() => {
        const start = (page - 1) * ORDERS_PAGE_SIZE;
        return orders.slice(start, start + ORDERS_PAGE_SIZE);
    }, [orders, page]);

    useEffect(() => {
        setPage((current) => Math.min(Math.max(1, current), maxPage));
    }, [maxPage]);
    const emptyStateText = useMemo(() => {
        if (!isAuth) return "Войдите, чтобы увидеть оплаченные заказы.";
        return "Оплаченных заказов пока нет.";
    }, [isAuth]);

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return <p className="text-sm text-destructive">{error}</p>;
    }

    if (!hasOrders) {
        return <p className="text-sm text-muted-foreground">{emptyStateText}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span>
                    Стр. {page} из {maxPage}
                </span>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                >
                    Назад
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                    disabled={page >= maxPage}
                >
                    Далее
                </Button>
            </div>

            {pageOrders.map((order) => (
                <Card key={order.id}>
                    <CardHeader className="border-b">
                        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                            <span>Заказ · {formatDate(order.createdAt)}</span>
                            <span className="text-sm font-medium text-muted-foreground">
                                {formatOrderStatus(order.status)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {order.items?.map((item) => {
                                const product = productsById[item.productId];
                                const currency = product?.currency ?? "RUB";
                                const lineTotal = toNumber(item.price) * (Number(item.quantity) || 0);
                                const media = product?.media?.slice().sort((a, b) => a.order - b.order) ?? [];
                                const thumb = media[0] ?? null;

                                return (
                                    <div key={item.id} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted shrink-0">
                                                {thumb ? (
                                                    <Image
                                                        src={resolveMediaUrl(thumb.url)}
                                                        alt={thumb.alt ?? item.title}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-sm font-medium">{formatMoney(lineTotal, currency)}</span>
                                            {product ? (
                                                <ProductDetailsDialog
                                                    product={product}
                                                    inCart={false}
                                                    cartBusy={false}
                                                    className="h-8 px-3 text-xs"
                                                />
                                            ) : (
                                                <Skeleton className="h-8 w-24 rounded-md" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-sm text-muted-foreground">Итого</span>
                            <span className="text-sm font-semibold">
                                {formatMoney(toNumber(order.total), getOrderCurrency(order, productsById))}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

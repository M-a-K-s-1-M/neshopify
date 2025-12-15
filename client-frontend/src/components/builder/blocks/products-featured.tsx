'use client'

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/utils/media";

interface ProductsFeaturedProps {
    block: BlockInstanceDto;
    siteId: string;
}

const MAX_FEATURED_PRODUCTS = 4;

type ProductsFeaturedBackground = "default" | "card" | "muted";

export function ProductsFeaturedBlock({ block, siteId }: ProductsFeaturedProps) {
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
                        href="/catalog"
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

                                return (
                                    <div key={product.id} className="space-y-4">
                                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                                            {cover ? (
                                                <Image
                                                    src={resolveMediaUrl(cover.url)}
                                                    alt={cover.alt ?? product.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
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
                                    </div>
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

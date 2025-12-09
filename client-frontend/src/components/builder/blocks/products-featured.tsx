'use client'

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { BlockInstanceDto, ProductDto } from "@/lib/types";
import { ProductsApi } from "@/lib/api/products";

interface ProductsFeaturedProps {
    block: BlockInstanceDto;
    siteId: string;
}

export function ProductsFeaturedBlock({ block, siteId }: ProductsFeaturedProps) {
    const data = block.data ?? {};
    const productIds = Array.isArray(data.productIds) ? (data.productIds as string[]) : [];
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const productKey = useMemo(() => productIds.join(','), [productIds]);

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

    return (
        <section className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{data.title ?? 'Популярные товары'}</h2>
                {data.subtitle && <p className="text-muted-foreground">{data.subtitle}</p>}
            </div>

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: productIds.length || 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-48 rounded-xl" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {!loading && !error && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Card key={product.id} className="overflow-hidden">
                                {product.media?.[0]?.url && (
                                    <div className="relative h-40 w-full">
                                        <Image
                                            src={product.media[0].url}
                                            alt={product.media[0].alt ?? product.title}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="line-clamp-1 text-base">{product.title}</CardTitle>
                                    <CardDescription>
                                        {Number(product.price).toLocaleString('ru-RU')} {product.currency}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-6 text-center text-sm text-muted-foreground">
                            Добавьте товары в блок, чтобы показать витрину.
                        </Card>
                    )}
                </div>
            )}

            {Array.isArray(data.productIds) && data.productIds.length === 0 && (
                <Button variant="outline" size="sm">
                    Добавить товары
                </Button>
            )}
        </section>
    );
}

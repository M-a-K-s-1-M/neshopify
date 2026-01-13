"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { ProductsCatalogEditor } from "@/components/dashboard/site/products/products-catalog-editor";

export default function Products() {
    const params = useParams<{ siteId?: string }>();

    const siteId = useMemo(() => {
        const raw = params?.siteId;
        if (!raw) return undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.siteId]);

    if (!siteId) {
        return (
            <section className="space-y-4 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                <h1 className="text-xl font-semibold text-foreground">Товары недоступны</h1>
                <p>Не удалось определить идентификатор сайта из адреса.</p>
            </section>
        );
    }

    return <ProductsCatalogEditor siteId={siteId} />;
}

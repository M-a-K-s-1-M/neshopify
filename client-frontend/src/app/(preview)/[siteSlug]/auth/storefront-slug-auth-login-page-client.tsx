"use client";

import { useEffect, useState } from "react";

import { StoreLoginForm } from "@/components/shared/forms/store-login-form";
import { StorefrontApi } from "@/lib/api/storefront";
import { getRequestErrorMessage } from "@/lib/utils/error";

export default function StorefrontSlugAuthLoginPageClient({ siteSlug }: { siteSlug: string }) {
    const [siteId, setSiteId] = useState<string | null>(null);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const site = await StorefrontApi.getSiteBySlug(siteSlug);
                if (!cancelled) {
                    setSiteId(site.id);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [siteSlug]);

    const basePath = `/${siteSlug}`;

    if (error) {
        return (
            <main className="min-h-dvh bg-background px-6 py-10">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {getRequestErrorMessage(error, "Не удалось загрузить магазин")}
                </div>
            </main>
        );
    }

    if (!siteId) {
        return (
            <main className="min-h-dvh bg-background px-6 py-10 text-sm text-muted-foreground">
                Загружаем магазин...
            </main>
        );
    }

    return (
        <main className="min-h-dvh bg-background px-6 py-10">
            <StoreLoginForm siteId={siteId} basePath={basePath} />
        </main>
    );
}

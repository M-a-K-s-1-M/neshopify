"use client";

import { useEffect, useState } from "react";

import { StoreLoginForm } from "@/components/shared/forms/store-login-form";
import { StorefrontApi } from "@/lib/api/storefront";
import { getRequestErrorMessage } from "@/lib/utils/error";

export default function StorefrontIdSlugAuthLoginPageClient({
    siteId,
    siteSlug,
}: {
    siteId: string;
    siteSlug: string;
}) {
    const [resolvedSiteId, setResolvedSiteId] = useState<string | null>(null);
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | null>(null);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const site = await StorefrontApi.getSite(siteId);
                if (cancelled) return;
                setResolvedSiteId(site.id);
                setStatus(site.status);
            } catch (e) {
                if (!cancelled) setError(e);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [siteId]);

    const basePath = `/${siteId}/${siteSlug}`;

    if (error) {
        return (
            <main className="min-h-dvh bg-background px-6 py-10">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {getRequestErrorMessage(error, "Не удалось загрузить магазин")}
                </div>
            </main>
        );
    }

    if (!resolvedSiteId || !status) {
        return (
            <main className="min-h-dvh bg-background px-6 py-10 text-sm text-muted-foreground">
                Загружаем магазин...
            </main>
        );
    }

    if (status !== "PUBLISHED") {
        return (
            <main className="min-h-dvh bg-background px-6 py-10">
                <div className="rounded-xl border border-muted-foreground/30 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Этот сайт не опубликован.
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh bg-background px-6 py-10">
            <StoreLoginForm siteId={resolvedSiteId} basePath={basePath} />
        </main>
    );
}

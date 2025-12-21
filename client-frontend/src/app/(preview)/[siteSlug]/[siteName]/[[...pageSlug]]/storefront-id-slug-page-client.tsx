"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SitePageView } from "@/components/builder/site-page-view";
import { StorefrontApi } from "@/lib/api/storefront";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";

function joinSlug(parts?: string[]) {
    if (!parts || parts.length === 0) return "home";
    return parts.map((part) => decodeURIComponent(part)).join("/");
}

export default function StorefrontIdSlugPageClient({
    siteId,
    siteSlug,
    pageSlug,
}: {
    siteId: string;
    siteSlug: string;
    pageSlug?: string[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const refresh = useAuthStore((s) => s.refresh);

    const [resolvedSiteId, setResolvedSiteId] = useState<string | null>(null);
    const [siteStatus, setSiteStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | null>(null);
    const [error, setError] = useState<unknown>(null);

    const resolvedSlug = useMemo(() => joinSlug(pageSlug), [pageSlug]);
    const basePath = useMemo(() => `/${siteId}/${siteSlug}`.replace(/\/+$/, ""), [siteId, siteSlug]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const siteDto = await StorefrontApi.getSite(siteId);

                if (cancelled) return;

                setResolvedSiteId(siteDto.id);
                setSiteStatus(siteDto.status);

                // Если slug в URL не совпал с текущим slug в БД — корректируем URL.
                if (siteDto.slug && siteDto.slug !== siteSlug) {
                    const encoded = pageSlug?.length
                        ? pageSlug.map((p) => encodeURIComponent(p)).join("/")
                        : "";
                    const nextUrl = encoded
                        ? `/${siteId}/${siteDto.slug}/${encoded}`
                        : `/${siteId}/${siteDto.slug}`;
                    router.replace(nextUrl);
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
    }, [pageSlug, router, siteId, siteSlug]);

    useEffect(() => {
        if (!resolvedSiteId) return;
        if (siteStatus !== "PUBLISHED") return;

        const isProtected = resolvedSlug === "cart" || resolvedSlug === "profile";
        if (!isProtected) return;

        let cancelled = false;

        const ensureAuth = async () => {
            const payload = await refresh();
            if (cancelled) return;

            if (!payload) {
                const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
                const params = new URLSearchParams();
                if (returnTo) params.set("returnTo", returnTo);
                const url = params.toString()
                    ? `${basePath}/auth?${params.toString()}`
                    : `${basePath}/auth`;
                router.replace(url);
            }
        };

        ensureAuth();

        return () => {
            cancelled = true;
        };
    }, [basePath, pathname, refresh, resolvedSlug, router, searchParams, resolvedSiteId, siteStatus]);

    if (error) {
        return (
            <div className="px-6 py-10">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {getRequestErrorMessage(error, "Не удалось загрузить сайт")}
                </div>
            </div>
        );
    }

    if (!resolvedSiteId || !siteStatus) {
        return <div className="px-6 py-10 text-sm text-muted-foreground">Загружаем сайт...</div>;
    }

    if (siteStatus !== "PUBLISHED") {
        return (
            <div className="px-6 py-10">
                <div className="rounded-xl border border-muted-foreground/30 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Этот сайт не опубликован.
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-dvh bg-background">
            <SitePageView slug={resolvedSlug} variant="runtime" siteIdOverride={resolvedSiteId} />
        </main>
    );
}

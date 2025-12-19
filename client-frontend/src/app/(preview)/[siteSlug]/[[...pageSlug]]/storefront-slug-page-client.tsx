"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SitePageView } from "@/components/builder/site-page-view";
import { StorefrontApi } from "@/lib/api/storefront";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";

type StorefrontSite = { id: string };

function joinSlug(parts?: string[]) {
    if (!parts || parts.length === 0) return "home";
    return parts.map((part) => decodeURIComponent(part)).join("/");
}

export default function StorefrontSlugPageClient({
    siteSlug,
    pageSlug,
}: {
    siteSlug: string;
    pageSlug?: string[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const refresh = useAuthStore((s) => s.refresh);

    const [site, setSite] = useState<StorefrontSite | null>(null);
    const [error, setError] = useState<unknown>(null);

    const resolvedSlug = useMemo(() => joinSlug(pageSlug), [pageSlug]);
    const basePath = useMemo(() => `/${siteSlug}`, [siteSlug]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const siteDto = await StorefrontApi.getSiteBySlug(siteSlug);
                if (!cancelled) {
                    setSite({ id: siteDto.id });
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

    useEffect(() => {
        if (!site?.id) return;

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
                const url = params.toString() ? `${basePath}/auth?${params.toString()}` : `${basePath}/auth`;
                router.replace(url);
            }
        };

        ensureAuth();

        return () => {
            cancelled = true;
        };
    }, [basePath, pathname, refresh, resolvedSlug, router, searchParams, site?.id]);

    if (error) {
        return (
            <div className="px-6 py-10">
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {getRequestErrorMessage(error, "Не удалось загрузить сайт")}
                </div>
            </div>
        );
    }

    if (!site?.id) {
        return (
            <div className="px-6 py-10 text-sm text-muted-foreground">
                Загружаем сайт...
            </div>
        );
    }

    return (
        <main className="min-h-dvh bg-background">
            <SitePageView slug={resolvedSlug} variant="runtime" siteIdOverride={site.id} />
        </main>
    );
}

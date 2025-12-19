"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SitePageView } from "@/components/builder/site-page-view";
import { INTERNAL_LAYOUT_PAGE_SLUG } from "@/components/builder/default-page-blocks";
import { useSitePagesQuery } from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/useAuthStore";

function buildStoreAuthRedirectUrl({ siteId, returnTo }: { siteId: string; returnTo: string }) {
    const params = new URLSearchParams();
    params.set("returnTo", returnTo);
    return `/preview/sites/${siteId}/auth?${params.toString()}`;
}

export default function PreviewSitePageClient({
    siteId,
    pageSlug,
}: {
    siteId: string;
    pageSlug?: string[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const refresh = useAuthStore((s) => s.refresh);
    const isAuth = useAuthStore((s) => s.isAuth);
    const [isProtectedChecking, setIsProtectedChecking] = useState(false);

    const slugFromUrl = pageSlug?.length ? pageSlug.join("/") : "";

    const { data: pages } = useSitePagesQuery(siteId);

    const resolvedSlug = useMemo(() => {
        if (slugFromUrl && slugFromUrl !== INTERNAL_LAYOUT_PAGE_SLUG) {
            return slugFromUrl;
        }

        const visiblePages = (pages ?? []).filter((p) => p.slug !== INTERNAL_LAYOUT_PAGE_SLUG && p.isVisible);
        const home = visiblePages.find((p) => p.type === "HOME" || p.slug === "home");
        return (home ?? visiblePages[0] ?? (pages ?? [])[0])?.slug ?? "home";
    }, [slugFromUrl, pages]);

    const requestedSlug = slugFromUrl || resolvedSlug;
    const isProtected = requestedSlug === "cart" || requestedSlug === "profile";

    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            if (!isProtected) {
                setIsProtectedChecking(false);
                return;
            }

            if (isAuth) {
                setIsProtectedChecking(false);
                return;
            }

            setIsProtectedChecking(true);

            const payload = await refresh();

            if (cancelled) return;

            if (!payload) {
                const query = searchParams.toString();
                const returnTo = query ? `${pathname}?${query}` : pathname;
                router.replace(buildStoreAuthRedirectUrl({ siteId, returnTo }));
                return;
            }

            setIsProtectedChecking(false);
        };

        void verify();

        return () => {
            cancelled = true;
        };
    }, [isProtected, isAuth, refresh, pathname, searchParams, router, siteId]);

    return (
        <main className="min-h-dvh bg-background">
            {isProtected && isProtectedChecking ? (
                <div className="flex min-h-[240px] w-full items-center justify-center text-sm text-muted-foreground">
                    Проверяем доступ...
                </div>
            ) : (
                <SitePageView slug={resolvedSlug} variant="runtime" />
            )}
        </main>
    );
}

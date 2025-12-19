"use client";

import { useMemo } from "react";

import { SitePageView } from "@/components/builder/site-page-view";
import { INTERNAL_LAYOUT_PAGE_SLUG } from "@/components/builder/default-page-blocks";
import { useSitePagesQuery } from "@/lib/query/hooks";

export default function PreviewSitePageClient({
    siteId,
    pageSlug,
}: {
    siteId: string;
    pageSlug?: string[];
}) {
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

    return (
        <main className="min-h-dvh bg-background">
            <SitePageView slug={resolvedSlug} variant="runtime" />
        </main>
    );
}

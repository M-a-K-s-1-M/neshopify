'use client';

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { AddPageBtn, HeaderPage, PreviewSiteBtn, PublishSiteBtn, SettingsSiteBtn, UnpublishSiteBtn } from "@/components";
import { PageCard } from "@/components/dashboard/site/page-card";
import { INTERNAL_LAYOUT_PAGE_SLUG } from "@/components/builder/default-page-blocks";
import { SitesApi } from "@/lib/api/sites";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";

export default function Site() {
    const params = useParams<{ siteId: string }>();
    const siteId = Array.isArray(params?.siteId) ? params?.siteId[0] : params?.siteId;

    const siteQueryKey = siteId ? queryKeys.site(siteId) : ["sites", "pending"] as const;
    const pagesQueryKey = siteId ? queryKeys.sitePages(siteId) : ["sites", "pending", "pages"] as const;

    const {
        data: site,
        isLoading: siteLoading,
        error: siteError,
    } = useQuery({
        queryKey: siteQueryKey,
        queryFn: () => SitesApi.get(siteId as string),
        enabled: Boolean(siteId),
    });

    const {
        data: pages,
        isLoading: pagesLoading,
        error: pagesError,
    } = useQuery({
        queryKey: pagesQueryKey,
        queryFn: () => SitesApi.getPages(siteId as string),
        enabled: Boolean(siteId),
    });

    const errorMessage = useMemo(() => {
        if (siteError) return getRequestErrorMessage(siteError, "Не удалось загрузить сайт");
        if (pagesError) return getRequestErrorMessage(pagesError, "Не удалось загрузить страницы");
        return null;
    }, [siteError, pagesError]);

    if (!siteId) {
        return <div className="text-destructive">Не удалось определить сайт</div>;
    }

    const visiblePages = pages?.filter((page) => page.slug !== INTERNAL_LAYOUT_PAGE_SLUG) ?? [];

    return (
        <div className="space-y-6">
            <HeaderPage>
                <div className="flex items-center gap-3  text-sm text-muted-foreground mb-3">
                    <p className="text-xl font-semibold text-foreground">{site?.name ?? "Загрузка..."}</p>
                    <p className="font-mono text-xs">/{site?.slug ?? "..."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <SettingsSiteBtn href={`/sites/${siteId}/settings`} />
                    <PreviewSiteBtn href={`/preview/sites/${siteId}`} />
                    {site?.status === 'PUBLISHED' ? (
                        <UnpublishSiteBtn siteId={siteId} />
                    ) : (
                        <PublishSiteBtn siteId={siteId} />
                    )}
                    <AddPageBtn siteId={siteId} />
                </div>
            </HeaderPage>

            {errorMessage ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

            {siteLoading || pagesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Загружаем данные сайта...
                </div>
            ) : null}

            {!pagesLoading && pages && visiblePages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10 text-center">
                    <p className="text-lg font-semibold">На сайте пока нет страниц</p>
                    <p className="text-sm text-muted-foreground">
                        Создайте страницу, чтобы начать собирать структуру магазина в конструкторе.
                    </p>
                </div>
            ) : null}

            {!pagesLoading && pages && visiblePages.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {visiblePages.map((page) => (
                        <PageCard key={page.id} page={page} siteId={siteId} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

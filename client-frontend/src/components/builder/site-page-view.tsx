'use client'

import { useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { BlockRenderer } from "./block-registry";
import { useSiteStore } from "@/stores/useSiteStore";

interface SitePageViewProps {
    slug: string;
    title?: string;
    description?: string;
}

const buildPageDetailKey = (siteId: string, pageId: string) => `${siteId}:${pageId}`;

export function SitePageView({ slug, title, description }: SitePageViewProps) {
    const params = useParams<{ siteId?: string }>();
    const rawSiteId = params?.siteId;
    const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;

    const setActiveSite = useSiteStore((state) => state.setActiveSite);
    const fetchSite = useSiteStore((state) => state.fetchSite);
    const fetchPages = useSiteStore((state) => state.fetchPages);
    const fetchPageDetail = useSiteStore((state) => state.fetchPageDetail);
    const sitesById = useSiteStore((state) => state.sitesById);
    const pagesBySite = useSiteStore((state) => state.pagesBySite);
    const pageDetails = useSiteStore((state) => state.pageDetails);
    const activeSiteId = useSiteStore((state) => state.activeSiteId);
    const isLoadingSites = useSiteStore((state) => state.isLoadingSites);
    const pagesLoading = useSiteStore((state) => state.pagesLoading);
    const pageDetailsLoading = useSiteStore((state) => state.pageDetailsLoading);
    const error = useSiteStore((state) => state.error);

    useEffect(() => {
        if (!siteId) {
            return;
        }
        if (activeSiteId !== siteId) {
            setActiveSite(siteId);
        }
        fetchSite(siteId).catch(() => undefined);
        fetchPages(siteId).catch(() => undefined);
    }, [siteId, activeSiteId, setActiveSite, fetchSite, fetchPages]);

    const pages = siteId ? pagesBySite[siteId] : undefined;
    const currentPage = useMemo(() => pages?.find((page) => page.slug === slug), [pages, slug]);

    useEffect(() => {
        if (!siteId || !currentPage?.id) {
            return;
        }
        fetchPageDetail(siteId, currentPage.id).catch(() => undefined);
    }, [siteId, currentPage?.id, fetchPageDetail]);

    const pageKey = siteId && currentPage ? buildPageDetailKey(siteId, currentPage.id) : undefined;
    const detailedPage = pageKey ? pageDetails[pageKey] : undefined;
    const resolvedPage = detailedPage ?? currentPage;

    const blocks = useMemo(() => {
        if (!resolvedPage?.blocks) {
            return [];
        }
        return [...resolvedPage.blocks]
            .filter((block) => Boolean(block?.template?.key))
            .sort((a, b) => a.order - b.order);
    }, [resolvedPage?.blocks]);

    const site = siteId ? sitesById[siteId] : undefined;
    const loadingPages = siteId ? pagesLoading[siteId] : false;
    const loadingPageDetail = pageKey ? pageDetailsLoading[pageKey] : false;
    const isLoading = isLoadingSites || loadingPages || loadingPageDetail;

    if (!siteId) {
        return (
            <StateMessage
                variant="error"
                title="Не удалось определить сайт"
                description="Проверьте, что вы перешли по корректной ссылке конструктора."
            />
        );
    }

    const pageHeading = title ?? resolvedPage?.title ?? "Страница";
    const seoDescription = resolvedPage?.seo?.description;
    const pageDescription =
        description ?? (typeof seoDescription === "string" ? seoDescription : "");

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {site?.name ?? "Сайт"} · {slug}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">{pageHeading}</h1>
                {pageDescription ? <p className="text-sm text-muted-foreground">{pageDescription}</p> : null}
            </header>

            {error ? <StateMessage variant="error" title="Ошибка" description={error} /> : null}

            {isLoading ? (
                <div className="flex items-center justify-center rounded-xl border border-border bg-card py-12 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка страницы
                </div>
            ) : null}

            {!isLoading && !resolvedPage ? (
                <StateMessage
                    title="Страница не найдена"
                    description="Мы не нашли страницу с таким адресом. Убедитесь, что страница существует в админке."
                />
            ) : null}

            {!isLoading && resolvedPage && blocks.length === 0 ? (
                <StateMessage
                    title="На странице пока нет блоков"
                    description="Добавьте блоки в админке, чтобы увидеть предпросмотр здесь."
                />
            ) : null}

            {!isLoading && resolvedPage && blocks.length > 0 ? (
                <div className="space-y-4">
                    {blocks.map((block) => (
                        <div key={block.id} className="rounded-2xl border border-border bg-card">
                            <BlockRenderer block={block} siteId={siteId} />
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

interface StateMessageProps {
    title: string;
    description?: string;
    variant?: "default" | "error";
}

function StateMessage({ title, description, variant = "default" }: StateMessageProps) {
    const isError = variant === "error";
    const baseClasses = "rounded-xl border px-4 py-3 text-sm";
    const variantClasses = isError
        ? "border-destructive/50 bg-destructive/10 text-destructive"
        : "border-border bg-muted/50 text-muted-foreground";
    const descriptionClasses = isError ? "text-destructive" : "text-muted-foreground";

    return (
        <div className={`${baseClasses} ${variantClasses}`}>
            <p className="font-medium">{title}</p>
            {description ? <p className={descriptionClasses}>{description}</p> : null}
        </div>
    );
}

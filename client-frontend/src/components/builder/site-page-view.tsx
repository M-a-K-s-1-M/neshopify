"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { BlockRenderer } from "./block-registry";
import { useSiteQuery, useSitePagesQuery, usePageDetailQuery } from "@/lib/query/hooks";
import { getDefaultBlocksForPageType } from "./default-page-blocks";
import { getRequestErrorMessage } from "@/lib/utils/error";

interface SitePageViewProps {
    slug: string;
    title?: string;
    description?: string;
}

export function SitePageView({ slug, title, description }: SitePageViewProps) {
    const params = useParams<{ siteId?: string }>();
    const rawSiteId = params?.siteId;
    const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;

    if (!siteId) {
        return (
            <StateMessage
                variant="error"
                title="Не удалось определить сайт"
                description="Проверьте, что вы перешли по корректной ссылке конструктора."
            />
        );
    }

    const {
        data: site,
        isLoading: siteLoading,
        error: siteError,
    } = useSiteQuery(siteId);

    const {
        data: pages,
        isLoading: pagesLoading,
        error: pagesError,
    } = useSitePagesQuery(siteId);

    const currentPage = useMemo(() => pages?.find((page) => page.slug === slug), [pages, slug]);
    const pageId = currentPage?.id;

    const {
        data: pageDetail,
        isLoading: pageLoading,
        error: pageError,
    } = usePageDetailQuery(siteId, pageId);

    const resolvedPage = pageDetail ?? currentPage;

    const actualBlocks = useMemo(() => {
        if (!resolvedPage?.blocks) {
            return [];
        }
        return [...resolvedPage.blocks]
            .filter((block) => Boolean(block?.template?.key))
            .sort((a, b) => a.order - b.order);
    }, [resolvedPage?.blocks]);

    const fallbackBlocks = useMemo(() => {
        if (!resolvedPage || actualBlocks.length > 0) {
            return [];
        }
        return getDefaultBlocksForPageType(resolvedPage.type);
    }, [resolvedPage, actualBlocks.length]);

    const blocks = actualBlocks.length > 0 ? actualBlocks : fallbackBlocks;

    const isLoading = siteLoading || pagesLoading || pageLoading;
    const pageHeading = title ?? resolvedPage?.title ?? "Страница";
    const seoDescription = resolvedPage?.seo?.description;
    const pageDescription = description ?? (typeof seoDescription === "string" ? seoDescription : "");

    const errorMessage = siteError
        ? getRequestErrorMessage(siteError, "Не удалось загрузить сайт")
        : pagesError
            ? getRequestErrorMessage(pagesError, "Не удалось загрузить страницы")
            : pageError
                ? getRequestErrorMessage(pageError, "Не удалось загрузить страницу")
                : undefined;

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {site?.name ?? "Сайт"} · {slug}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">{pageHeading}</h1>
                {pageDescription ? <p className="text-sm text-muted-foreground">{pageDescription}</p> : null}
            </header>

            {errorMessage ? (
                <StateMessage variant="error" title="Ошибка" description={errorMessage} />
            ) : null}

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

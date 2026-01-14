"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { BlockRenderer } from "./block-registry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileOrdersTab } from "./profile-orders-tab";
import { OrdersApi } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    usePageDetailQuery,
    useSitePagesQuery,
    useSiteQuery,
    useStorefrontPageDetailQuery,
    useStorefrontSitePagesQuery,
    useStorefrontSiteQuery,
} from "@/lib/query/hooks";
import { getDefaultBlocksForPageType, INTERNAL_LAYOUT_PAGE_SLUG } from "./default-page-blocks";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { CatalogFiltersProvider } from "./catalog-filters-context";
import type { BlockInstanceDto } from "@/lib/types";

interface SitePageViewProps {
    slug: string;
    title?: string;
    description?: string;
    variant?: "builder" | "runtime";
    siteIdOverride?: string;
}

export function SitePageView({ slug, title, description, variant = "builder", siteIdOverride }: SitePageViewProps) {
    const params = useParams<{ siteId?: string }>();
    const rawSiteId = params?.siteId;
    const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;
    const isRuntime = variant === "runtime";

    const effectiveSiteId = siteIdOverride ?? siteId;

    if (!effectiveSiteId) {
        return (
            <StateMessage
                variant="error"
                title="Не удалось определить сайт"
                description="Проверьте, что вы перешли по корректной ссылке конструктора."
            />
        );
    }

    const builderEnabled = !isRuntime;
    const storefrontEnabled = isRuntime;

    const siteQuery = useSiteQuery(effectiveSiteId, { enabled: builderEnabled });
    const storefrontSiteQuery = useStorefrontSiteQuery(effectiveSiteId, { enabled: storefrontEnabled });

    const pagesQuery = useSitePagesQuery(effectiveSiteId, { enabled: builderEnabled });
    const storefrontPagesQuery = useStorefrontSitePagesQuery(effectiveSiteId, { enabled: storefrontEnabled });

    const site = isRuntime ? storefrontSiteQuery.data : siteQuery.data;
    const siteLoading = isRuntime ? storefrontSiteQuery.isLoading : siteQuery.isLoading;
    const siteError = isRuntime ? storefrontSiteQuery.error : siteQuery.error;

    const pages = isRuntime ? storefrontPagesQuery.data : pagesQuery.data;
    const pagesLoading = isRuntime ? storefrontPagesQuery.isLoading : pagesQuery.isLoading;
    const pagesError = isRuntime ? storefrontPagesQuery.error : pagesQuery.error;

    const layoutPage = useMemo(
        () => pages?.find((page) => page.slug === INTERNAL_LAYOUT_PAGE_SLUG),
        [pages],
    );

    const currentPage = useMemo(() => pages?.find((page) => page.slug === slug), [pages, slug]);
    const pageId = currentPage?.id;

    const layoutPageDetailQuery = usePageDetailQuery(effectiveSiteId, layoutPage?.id, { enabled: builderEnabled });
    const layoutStorefrontPageDetailQuery = useStorefrontPageDetailQuery(effectiveSiteId, layoutPage?.id, {
        enabled: storefrontEnabled,
    });

    const pageDetailQuery = usePageDetailQuery(effectiveSiteId, pageId, { enabled: builderEnabled });
    const storefrontPageDetailQuery = useStorefrontPageDetailQuery(effectiveSiteId, pageId, { enabled: storefrontEnabled });

    const layoutPageDetail = isRuntime ? layoutStorefrontPageDetailQuery.data : layoutPageDetailQuery.data;
    const layoutLoading = isRuntime ? layoutStorefrontPageDetailQuery.isLoading : layoutPageDetailQuery.isLoading;
    const layoutError = isRuntime ? layoutStorefrontPageDetailQuery.error : layoutPageDetailQuery.error;

    const pageDetail = isRuntime ? storefrontPageDetailQuery.data : pageDetailQuery.data;
    const pageLoading = isRuntime ? storefrontPageDetailQuery.isLoading : pageDetailQuery.isLoading;
    const pageError = isRuntime ? storefrontPageDetailQuery.error : pageDetailQuery.error;

    const resolvedPage = pageDetail ?? currentPage;

    const layoutBlocks = useMemo(() => {
        if (!layoutPageDetail?.blocks) {
            return [];
        }

        return [...layoutPageDetail.blocks]
            .filter((block) => Boolean(block?.template?.key))
            .sort((a, b) => a.order - b.order);
    }, [layoutPageDetail?.blocks]);

    const actualBlocks = useMemo(() => {
        if (!resolvedPage?.blocks) {
            return [];
        }
        return [...resolvedPage.blocks]
            .filter((block) => Boolean(block?.template?.key))
            .sort((a, b) => a.order - b.order);
    }, [resolvedPage?.blocks]);

    const { globalHeader, globalFooter } = useMemo(() => {
        const hasLayout = Boolean(layoutPage?.id);
        const headerFromLayout = layoutBlocks.find((b) => b.template.key.startsWith("header-")) ?? null;
        const footerFromLayout = layoutBlocks.find((b) => b.template.key.startsWith("footer-")) ?? null;

        if (hasLayout) {
            return {
                globalHeader: headerFromLayout,
                globalFooter: footerFromLayout,
            };
        }

        // Fallback для старых сайтов: пока layout-страницы нет, берем header/footer со страницы.
        const headerFromPage = actualBlocks.find((b) => b.template.key.startsWith("header-")) ?? null;
        const footerFromPage = actualBlocks.find((b) => b.template.key.startsWith("footer-")) ?? null;

        return {
            globalHeader: headerFromPage,
            globalFooter: footerFromPage,
        };
    }, [layoutBlocks, layoutPage?.id, actualBlocks]);

    const fallbackBlocks = useMemo(() => {
        if (!resolvedPage || actualBlocks.length > 0) {
            return [];
        }
        return getDefaultBlocksForPageType(resolvedPage.type);
    }, [resolvedPage, actualBlocks.length]);

    const blocks = useMemo(() => {
        const sourceBlocks = actualBlocks.length > 0 ? actualBlocks : fallbackBlocks;

        const contentBlocks = sourceBlocks.filter(
            (block) => !block.template.key.startsWith("header-") && !block.template.key.startsWith("footer-"),
        );

        return [
            ...(globalHeader ? [globalHeader] : []),
            ...contentBlocks,
            ...(globalFooter ? [globalFooter] : []),
        ];
    }, [actualBlocks, fallbackBlocks, globalHeader, globalFooter]);

    const isLoading = siteLoading || pagesLoading || pageLoading || layoutLoading;
    const pageHeading = title ?? resolvedPage?.title ?? "Страница";
    const seoDescription = resolvedPage?.seo?.description;
    const pageDescription = description ?? (typeof seoDescription === "string" ? seoDescription : "");

    const errorMessage = siteError
        ? getRequestErrorMessage(siteError, "Не удалось загрузить сайт")
        : pagesError
            ? getRequestErrorMessage(pagesError, "Не удалось загрузить страницы")
            : pageError
                ? getRequestErrorMessage(pageError, "Не удалось загрузить страницу")
                : layoutError
                    ? getRequestErrorMessage(layoutError, "Не удалось загрузить layout сайта")
                    : undefined;

    const showMetaHeader = variant === "builder";
    const isProfilePage = slug === "profile";
    const isCartPage = slug === "cart";

    return (
        <div className={showMetaHeader ? "space-y-6" : "space-y-4"}>
            {showMetaHeader ? (
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {site?.name ?? "Сайт"} · {slug}
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">{pageHeading}</h1>
                    {pageDescription ? <p className="text-sm text-muted-foreground">{pageDescription}</p> : null}
                </header>
            ) : null}

            {errorMessage ? (
                <StateMessage variant="error" title="Ошибка" description={errorMessage} />
            ) : null}

            {isLoading ? (
                <div
                    className={
                        showMetaHeader
                            ? "flex items-center justify-center rounded-xl border border-border bg-card py-12 text-sm text-muted-foreground"
                            : "flex items-center justify-center py-12 text-sm text-muted-foreground"
                    }
                >
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
                <CatalogFiltersProvider>
                    {isProfilePage ? (
                        <ProfileTabsLayout blocks={blocks} siteId={effectiveSiteId} />
                    ) : isCartPage ? (
                        <CartTabsLayout blocks={blocks} siteId={effectiveSiteId} />
                    ) : (
                        <div className="space-y-4">
                            {blocks.map((block) => {
                                const isHeaderOrFooter =
                                    block.template.key.startsWith("header-") ||
                                    block.template.key.startsWith("footer-");

                                const isFullBleedBlock = block.template.key === "products-featured";

                                const isBorderlessCardBlock =
                                    block.template.key === "catalog-search-filter" ||
                                    block.template.key === "catalog-product-grid" ||
                                    block.template.key === "cart-items-list" ||
                                    block.template.key === "products-featured" ||
                                    block.template.key === "banners" ||
                                    block.template.key === "hero-brand-highlight" ||
                                    block.template.key === "profile-favorites-showcase" ||
                                    block.template.key === "profile-account-form";

                                if (isHeaderOrFooter) {
                                    return <BlockRenderer key={block.id} block={block} siteId={effectiveSiteId} />;
                                }

                                if (isFullBleedBlock) {
                                    return <BlockRenderer key={block.id} block={block} siteId={effectiveSiteId} />;
                                }

                                if (isBorderlessCardBlock) {
                                    return (
                                        <div key={block.id} className="px-6">
                                            <BlockRenderer block={block} siteId={effectiveSiteId} />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={block.id} className="px-6">
                                        <div className="rounded-2xl border border-border bg-card">
                                            <BlockRenderer block={block} siteId={effectiveSiteId} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CatalogFiltersProvider>
            ) : null}
        </div>
    );
}

function isCustomerForCurrentStore(user: any, siteId: string) {
    if (!user) return false;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    return roles.includes('CUSTOMER') && user.siteId === siteId;
}

function ProfileTabsLayout({ blocks, siteId }: { blocks: BlockInstanceDto[]; siteId: string }) {
    const headerBlocks = blocks.filter((block) => block.template.key.startsWith("header-"));
    const footerBlocks = blocks.filter((block) => block.template.key.startsWith("footer-"));
    const contentBlocks = blocks.filter(
        (block) => !block.template.key.startsWith("header-") && !block.template.key.startsWith("footer-"),
    );

    const accountBlocks = contentBlocks.filter((block) => block.template.key === "profile-account-form");
    const favoritesBlocks = contentBlocks.filter((block) => block.template.key === "profile-favorites-showcase");
    const otherBlocks = contentBlocks.filter(
        (block) => block.template.key !== "profile-account-form" && block.template.key !== "profile-favorites-showcase",
    );

    const defaultTab = accountBlocks.length > 0 ? "account" : "favorites";

    return (
        <div className="space-y-4">
            {headerBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} siteId={siteId} />
            ))}

            <div className="px-6">
                <Tabs defaultValue={defaultTab} className="gap-4">
                    <TabsList>
                        <TabsTrigger value="account">Профиль</TabsTrigger>
                        <TabsTrigger value="favorites">Избранное</TabsTrigger>
                        <TabsTrigger value="orders">Заказы</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="mt-0">
                        <div className="space-y-4">
                            {accountBlocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} siteId={siteId} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="favorites" className="mt-0">
                        <div className="space-y-4">
                            {favoritesBlocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} siteId={siteId} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="mt-0">
                        <ProfileOrdersTab siteId={siteId} />
                    </TabsContent>
                </Tabs>
            </div>

            {otherBlocks.map((block) => (
                <div key={block.id} className="px-6">
                    <BlockRenderer block={block} siteId={siteId} />
                </div>
            ))}

            {footerBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} siteId={siteId} />
            ))}
        </div>
    );
}

function CartTabsLayout({ blocks, siteId }: { blocks: BlockInstanceDto[]; siteId: string }) {
    const headerBlocks = blocks.filter((block) => block.template.key.startsWith("header-"));
    const footerBlocks = blocks.filter((block) => block.template.key.startsWith("footer-"));
    const contentBlocks = blocks.filter(
        (block) => !block.template.key.startsWith("header-") && !block.template.key.startsWith("footer-"),
    );

    const cartBlocks = contentBlocks.filter((block) => block.template.key === "cart-items-list");
    const otherBlocks = contentBlocks.filter((block) => block.template.key !== "cart-items-list");

    const isAuth = useAuthStore((s) => s.isAuth);
    const user = useAuthStore((s) => s.user);
    const refresh = useAuthStore((s) => s.refresh);

    const [hasOrders, setHasOrders] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!isAuth || !siteId) {
                setHasOrders(false);
                return;
            }

            const payload = user ?? (await refresh());
            const isCustomer = Boolean(payload && isCustomerForCurrentStore(payload, siteId));
            if (!isCustomer) {
                setHasOrders(false);
                return;
            }

            setHasOrders(null);
            try {
                const data = await OrdersApi.listMyPaid(siteId);
                if (cancelled) return;
                setHasOrders(Array.isArray(data) && data.length > 0);
            } catch {
                // Если не можем проверить — не блокируем вкладку.
                if (!cancelled) setHasOrders(true);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [isAuth, refresh, siteId, user]);

    const ordersDisabled = !isAuth || hasOrders !== true;

    return (
        <div className="space-y-4">
            {headerBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} siteId={siteId} />
            ))}

            <div className="px-6">
                <Tabs defaultValue="cart" className="gap-4">
                    <TabsList>
                        <TabsTrigger value="cart">Корзина</TabsTrigger>
                        <TabsTrigger value="orders" disabled={ordersDisabled}>
                            Заказы
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cart" className="mt-0">
                        <div className="space-y-4">
                            {cartBlocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} siteId={siteId} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="mt-0">
                        <ProfileOrdersTab siteId={siteId} />
                    </TabsContent>
                </Tabs>
            </div>

            {otherBlocks.map((block) => (
                <div key={block.id} className="px-6">
                    <BlockRenderer block={block} siteId={siteId} />
                </div>
            ))}

            {footerBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} siteId={siteId} />
            ))}
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

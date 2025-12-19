import { useQuery } from "@tanstack/react-query";

import { SitesApi } from "@/lib/api/sites";
import { PagesApi } from "@/lib/api/pages";
import { BlockTemplatesApi } from "@/lib/api/block-templates";
import { PageBlocksApi } from "@/lib/api/page-blocks";
import { StorefrontApi } from "@/lib/api/storefront";
import { queryKeys } from "./keys";

const disabledSiteKey = ["sites", "__disabled"] as const;
const disabledPagesKey = ["sites", "__disabled", "pages"] as const;
const disabledPageDetailKey = ["sites", "__disabled", "pages", "detail"] as const;
const disabledPageBlocksKey = ["sites", "__disabled", "pages", "blocks"] as const;

export function useSiteQuery(siteId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId ? queryKeys.site(siteId) : disabledSiteKey;
    return useQuery({
        queryKey,
        queryFn: () => SitesApi.get(siteId as string),
        enabled: Boolean(siteId) && (options?.enabled ?? true),
    });
}

export function useStorefrontSiteQuery(siteId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId ? ["storefront", ...queryKeys.site(siteId)] : disabledSiteKey;
    return useQuery({
        queryKey,
        queryFn: () => StorefrontApi.getSite(siteId as string),
        enabled: Boolean(siteId) && (options?.enabled ?? true),
    });
}

export function useSitesQuery() {
    return useQuery({
        queryKey: queryKeys.sites(),
        queryFn: () => SitesApi.list(),
        staleTime: 30 * 1000,
    });
}

export function useSitePagesQuery(siteId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId ? queryKeys.sitePages(siteId) : disabledPagesKey;
    return useQuery({
        queryKey,
        queryFn: () => SitesApi.getPages(siteId as string),
        enabled: Boolean(siteId) && (options?.enabled ?? true),
    });
}

export function useStorefrontSitePagesQuery(siteId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId ? ["storefront", ...queryKeys.sitePages(siteId)] : disabledPagesKey;
    return useQuery({
        queryKey,
        queryFn: () => StorefrontApi.getPages(siteId as string),
        enabled: Boolean(siteId) && (options?.enabled ?? true),
    });
}

export function usePageDetailQuery(siteId?: string, pageId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId && pageId ? queryKeys.page(siteId, pageId) : disabledPageDetailKey;
    return useQuery({
        queryKey,
        queryFn: () => PagesApi.get(siteId as string, pageId as string),
        enabled: Boolean(siteId && pageId) && (options?.enabled ?? true),
    });
}

export function useStorefrontPageDetailQuery(
    siteId?: string,
    pageId?: string,
    options?: { enabled?: boolean },
) {
    const queryKey = siteId && pageId ? ["storefront", ...queryKeys.page(siteId, pageId)] : disabledPageDetailKey;
    return useQuery({
        queryKey,
        queryFn: () => StorefrontApi.getPage(siteId as string, pageId as string),
        enabled: Boolean(siteId && pageId) && (options?.enabled ?? true),
    });
}

export function usePageBlocksQuery(siteId?: string, pageId?: string, options?: { enabled?: boolean }) {
    const queryKey = siteId && pageId ? queryKeys.pageBlocks(siteId, pageId) : disabledPageBlocksKey;
    return useQuery({
        queryKey,
        queryFn: () => PageBlocksApi.list(siteId as string, pageId as string),
        enabled: Boolean(siteId && pageId) && (options?.enabled ?? true),
    });
}

export function useBlockTemplatesQuery() {
    return useQuery({
        queryKey: queryKeys.blockTemplates(),
        queryFn: () => BlockTemplatesApi.list(),
        staleTime: 5 * 60 * 1000,
    });
}

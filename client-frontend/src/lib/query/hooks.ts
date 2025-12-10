import { useQuery } from "@tanstack/react-query";

import { SitesApi } from "@/lib/api/sites";
import { PagesApi } from "@/lib/api/pages";
import { BlockTemplatesApi } from "@/lib/api/block-templates";
import { PageBlocksApi } from "@/lib/api/page-blocks";
import { queryKeys } from "./keys";

const disabledSiteKey = ["sites", "__disabled"] as const;
const disabledPagesKey = ["sites", "__disabled", "pages"] as const;
const disabledPageDetailKey = ["sites", "__disabled", "pages", "detail"] as const;
const disabledPageBlocksKey = ["sites", "__disabled", "pages", "blocks"] as const;

export function useSiteQuery(siteId?: string) {
    const queryKey = siteId ? queryKeys.site(siteId) : disabledSiteKey;
    return useQuery({
        queryKey,
        queryFn: () => SitesApi.get(siteId as string),
        enabled: Boolean(siteId),
    });
}

export function useSitePagesQuery(siteId?: string) {
    const queryKey = siteId ? queryKeys.sitePages(siteId) : disabledPagesKey;
    return useQuery({
        queryKey,
        queryFn: () => SitesApi.getPages(siteId as string),
        enabled: Boolean(siteId),
    });
}

export function usePageDetailQuery(siteId?: string, pageId?: string) {
    const queryKey = siteId && pageId ? queryKeys.page(siteId, pageId) : disabledPageDetailKey;
    return useQuery({
        queryKey,
        queryFn: () => PagesApi.get(siteId as string, pageId as string),
        enabled: Boolean(siteId && pageId),
    });
}

export function usePageBlocksQuery(siteId?: string, pageId?: string) {
    const queryKey = siteId && pageId ? queryKeys.pageBlocks(siteId, pageId) : disabledPageBlocksKey;
    return useQuery({
        queryKey,
        queryFn: () => PageBlocksApi.list(siteId as string, pageId as string),
        enabled: Boolean(siteId && pageId),
    });
}

export function useBlockTemplatesQuery() {
    return useQuery({
        queryKey: queryKeys.blockTemplates(),
        queryFn: () => BlockTemplatesApi.list(),
        staleTime: 5 * 60 * 1000,
    });
}

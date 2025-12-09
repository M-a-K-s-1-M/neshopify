export const queryKeys = {
    sites: () => ["sites"] as const,
    site: (siteId: string) => ["sites", siteId] as const,
    sitePages: (siteId: string) => ["sites", siteId, "pages"] as const,
    page: (siteId: string, pageId: string) => ["sites", siteId, "pages", pageId] as const,
    pageBlocks: (siteId: string, pageId: string) => ["sites", siteId, "pages", pageId, "blocks"] as const,
    blockTemplates: () => ["block-templates"] as const,
};

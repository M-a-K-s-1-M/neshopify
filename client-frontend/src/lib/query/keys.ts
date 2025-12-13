export const queryKeys = {
    sites: () => ["sites"] as const,
    site: (siteId: string) => ["sites", siteId] as const,
    sitePages: (siteId: string) => ["sites", siteId, "pages"] as const,
    page: (siteId: string, pageId: string) => ["sites", siteId, "pages", pageId] as const,
    pageBlocks: (siteId: string, pageId: string) => ["sites", siteId, "pages", pageId, "blocks"] as const,
    blockTemplates: () => ["block-templates"] as const,
    siteProducts: (siteId: string) => ["sites", siteId, "products"] as const,
    siteProduct: (siteId: string, productId: string) => ["sites", siteId, "products", productId] as const,
    siteProductsList: (siteId: string, page: number, search?: string, limit?: number) =>
        ["sites", siteId, "products", { page, search: search ?? null, limit: limit ?? null }] as const,
    siteCategories: (siteId: string) => ["sites", siteId, "categories"] as const,
    siteCart: (siteId: string, sessionId?: string) =>
        ["sites", siteId, "cart", { sessionId: sessionId ?? null }] as const,
};

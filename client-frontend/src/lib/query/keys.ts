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
    siteCart: (
        siteId: string,
        ctx?: {
            userId?: string | null;
            sessionId?: string | null;
        },
    ) =>
        [
            "sites",
            siteId,
            "cart",
            {
                userId: ctx?.userId ?? null,
                sessionId: ctx?.sessionId ?? null,
            },
        ] as const,

    siteOrdersList: (
        siteId: string,
        params?: {
            page?: number;
            limit?: number;
            search?: string | null;
            status?: string | null;
            paymentStatus?: string | null;
        },
    ) =>
        [
            "sites",
            siteId,
            "orders",
            {
                page: params?.page ?? 1,
                limit: params?.limit ?? 100,
                search: params?.search ?? null,
                status: params?.status ?? null,
                paymentStatus: params?.paymentStatus ?? null,
            },
        ] as const,
};

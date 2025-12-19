import { $api } from "@/lib/config/httpConfig";
import type { PageDto, SiteDto } from "@/lib/types";

export class StorefrontApi {
    static async getSiteBySlug(slug: string): Promise<SiteDto> {
        const res = await $api.get<SiteDto>(`/storefront/sites/by-slug/${encodeURIComponent(slug)}`);
        return res.data;
    }

    static async getSite(siteId: string): Promise<SiteDto> {
        const res = await $api.get<SiteDto>(`/storefront/sites/${siteId}`);
        return res.data;
    }

    static async getPages(siteId: string): Promise<PageDto[]> {
        const res = await $api.get<PageDto[]>(`/storefront/sites/${siteId}/pages`);
        return res.data;
    }

    static async getPage(siteId: string, pageId: string): Promise<PageDto> {
        const res = await $api.get<PageDto>(`/storefront/sites/${siteId}/pages/${pageId}`);
        return res.data;
    }
}

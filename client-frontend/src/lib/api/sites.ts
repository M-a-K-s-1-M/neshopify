import { $api } from "@/lib/config/httpConfig";
import type {
    CreateSitePayload,
    PageDto,
    SiteDto,
    UpdateSitePayload,
} from "@/lib/types";

export class SitesApi {
    static async list(): Promise<SiteDto[]> {
        const res = await $api.get<SiteDto[]>("/sites");
        return res.data;
    }

    static async get(siteId: string): Promise<SiteDto> {
        const res = await $api.get<SiteDto>(`/sites/${siteId}`);
        return res.data;
    }

    static async getPages(siteId: string): Promise<PageDto[]> {
        const res = await $api.get<PageDto[]>(`/sites/${siteId}/pages`);
        return res.data;
    }

    static async create(payload: CreateSitePayload): Promise<SiteDto> {
        const res = await $api.post<SiteDto>("/sites", payload);
        return res.data;
    }

    static async update(siteId: string, payload: UpdateSitePayload): Promise<SiteDto> {
        const res = await $api.patch<SiteDto>(`/sites/${siteId}`, payload);
        return res.data;
    }

    static async remove(siteId: string): Promise<void> {
        await $api.delete(`/sites/${siteId}`);
    }
}

import { $api } from "@/lib/config/httpConfig";
import type { CreatePagePayload, PageDto, UpdatePagePayload } from "@/lib/types";

export class PagesApi {
    static async list(siteId: string): Promise<PageDto[]> {
        const res = await $api.get<PageDto[]>(`/sites/${siteId}/pages`);
        return res.data;
    }

    static async get(siteId: string, pageId: string): Promise<PageDto> {
        const res = await $api.get<PageDto>(`/sites/${siteId}/pages/${pageId}`);
        return res.data;
    }

    static async create(siteId: string, payload: CreatePagePayload): Promise<PageDto> {
        const res = await $api.post<PageDto>(`/sites/${siteId}/pages`, payload);
        return res.data;
    }

    static async update(siteId: string, pageId: string, payload: UpdatePagePayload): Promise<PageDto> {
        const res = await $api.patch<PageDto>(`/sites/${siteId}/pages/${pageId}`, payload);
        return res.data;
    }

    static async remove(siteId: string, pageId: string): Promise<void> {
        await $api.delete(`/sites/${siteId}/pages/${pageId}`);
    }
}

import { $api } from "@/lib/config/httpConfig";
import type { BlockInstanceDto, CreateBlockPayload, UpdateBlockPayload } from "@/lib/types";

export class PageBlocksApi {
    static async list(siteId: string, pageId: string): Promise<BlockInstanceDto[]> {
        const res = await $api.get<BlockInstanceDto[]>(`/sites/${siteId}/pages/${pageId}/blocks`);
        return res.data;
    }

    static async create(siteId: string, pageId: string, payload: CreateBlockPayload): Promise<BlockInstanceDto> {
        const res = await $api.post<BlockInstanceDto>(`/sites/${siteId}/pages/${pageId}/blocks`, payload);
        return res.data;
    }

    static async update(
        siteId: string,
        pageId: string,
        blockId: string,
        payload: UpdateBlockPayload,
    ): Promise<BlockInstanceDto> {
        const res = await $api.patch<BlockInstanceDto>(
            `/sites/${siteId}/pages/${pageId}/blocks/${blockId}`,
            payload,
        );
        return res.data;
    }

    static async remove(siteId: string, pageId: string, blockId: string): Promise<void> {
        await $api.delete(`/sites/${siteId}/pages/${pageId}/blocks/${blockId}`);
    }
}

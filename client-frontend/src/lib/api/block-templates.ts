import { $api } from "@/lib/config/httpConfig";
import type { BlockTemplateDto } from "@/lib/types";

export class BlockTemplatesApi {
    static async list(): Promise<BlockTemplateDto[]> {
        const res = await $api.get<BlockTemplateDto[]>("/block-templates");
        return res.data;
    }
}

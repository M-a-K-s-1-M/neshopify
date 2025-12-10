import { $api } from "@/lib/config/httpConfig";
import type { ProductCategoryDto } from "@/lib/types";

export class CategoriesApi {
    static async list(siteId: string): Promise<ProductCategoryDto[]> {
        const res = await $api.get<ProductCategoryDto[]>(`/sites/${siteId}/categories`);
        return res.data;
    }
}

import { $api } from "@/lib/config/httpConfig";
import type { ProductMediaDto } from "@/lib/types";

export class ProductMediaApi {
    static async upload(siteId: string, productId: string, files: File[]): Promise<ProductMediaDto[]> {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const res = await $api.post<ProductMediaDto[]>(
            `/sites/${siteId}/products/${productId}/media/upload`,
            formData,
        );

        return res.data;
    }

    static async list(siteId: string, productId: string): Promise<ProductMediaDto[]> {
        const res = await $api.get<ProductMediaDto[]>(`/sites/${siteId}/products/${productId}/media`);
        return res.data;
    }

    static async remove(siteId: string, productId: string, mediaId: string): Promise<void> {
        await $api.delete(`/sites/${siteId}/products/${productId}/media/${mediaId}`);
    }
}

import { $api } from "@/lib/config/httpConfig";
import type { CreateProductPayload, PaginatedResponse, ProductDto, UpdateProductPayload } from "@/lib/types";

export interface ProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    categoryIds?: string[];
    stockStatus?: string;
    inStock?: boolean;
    priceMin?: number;
    priceMax?: number;
}

export class ProductsApi {
    static async list(siteId: string, params: ProductListParams = {}): Promise<PaginatedResponse<ProductDto>> {
        const categoryIds = params.categoryIds?.filter(Boolean);
        const categoryIdsCsv = categoryIds && categoryIds.length > 0 ? categoryIds.join(',') : undefined;

        const res = await $api.get<PaginatedResponse<ProductDto>>(`/sites/${siteId}/products`, {
            params: {
                page: params.page ?? 1,
                limit: params.limit ?? 12,
                search: params.search,
                categoryId: params.categoryId,
                categoryIds: categoryIdsCsv,
                stockStatus: params.stockStatus,
                inStock: params.inStock,
                priceMin: params.priceMin,
                priceMax: params.priceMax,
            },
        });

        return res.data;
    }

    static async get(siteId: string, productId: string): Promise<ProductDto> {
        const res = await $api.get<ProductDto>(`/sites/${siteId}/products/${productId}`);
        return res.data;
    }

    static async create(siteId: string, payload: CreateProductPayload): Promise<ProductDto> {
        const res = await $api.post<ProductDto>(`/sites/${siteId}/products`, payload);
        return res.data;
    }

    static async update(siteId: string, productId: string, payload: UpdateProductPayload): Promise<ProductDto> {
        const res = await $api.patch<ProductDto>(`/sites/${siteId}/products/${productId}`, payload);
        return res.data;
    }

    static async remove(siteId: string, productId: string): Promise<void> {
        await $api.delete(`/sites/${siteId}/products/${productId}`);
    }
}

import { $api } from "@/lib/config/httpConfig";
import type { OrderDto, PaginatedResponse } from "@/lib/types";

export class OrdersApi {
    static async listMyPaid(siteId: string): Promise<OrderDto[]> {
        const res = await $api.get<OrderDto[]>(`/storefront/sites/${siteId}/orders/my`);
        return res.data;
    }
}

export type SiteOrdersListParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    includeItems?: 'true' | 'false';
};

export class SiteOrdersApi {
    static async list(siteId: string, params?: SiteOrdersListParams): Promise<PaginatedResponse<OrderDto>> {
        const res = await $api.get<PaginatedResponse<OrderDto>>(`/sites/${siteId}/orders`, {
            params,
        });
        return res.data;
    }
}

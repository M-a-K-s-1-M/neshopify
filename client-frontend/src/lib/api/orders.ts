import { $api } from "@/lib/config/httpConfig";
import type { OrderListResponseDto } from "@/lib/types";

export class OrdersApi {
    static async list(
        siteId: string,
        params?: {
            page?: number;
            limit?: number;
            search?: string;
            status?: string;
            paymentStatus?: string;
        },
    ): Promise<OrderListResponseDto> {
        const res = await $api.get<OrderListResponseDto>(`/sites/${siteId}/orders`, {
            params: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 100,
                search: params?.search,
                status: params?.status,
                paymentStatus: params?.paymentStatus,
            },
        });
        return res.data;
    }
}
